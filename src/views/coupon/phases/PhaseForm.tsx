import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import PickerInput from '../../../components/ui/PickerInput';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import EventFormSection from '../../../components/set-event/form/EventFormSection';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import StickyActionBar from '../../../components/set-event/form/StickyActionBar';
import { activationBlock, claimLimit, couponStatus, overlappingPhases, phaseDurationDays, type Brand, type Coupon, type CouponDisplayStatus, type Phase } from '../../../data/coupons';
import { couponApi, CouponApiError, type CouponAllocation } from '../../../data/mock/couponApi';
import CouponStatusBadge from '../CouponStatusBadge';
import { couponsAcrossBrands, toLocalParts, useCouponFormat } from '../format';
import { StateBox } from './PhaseList';
import CouponPickerModal, { minQuantity, quantityError } from './CouponPickerModal';
import { useT } from '@/i18n';

const CONTENT_WIDTH = 'max-w-[1200px]';
const PREVIEW_ID = 'preview';
const NAME_MAX = 60;

/** Local 'YYYY-MM-DD' → the phase's first and last instant (start of the first day, end of the last). */
const startIso = (d: string) => (d ? new Date(`${d}T00:00:00`).toISOString() : '');
const endIso = (d: string) => (d ? new Date(`${d}T23:59:59.999`).toISOString() : '');

interface Draft {
  name: string;
  start: string;
  end: string;
  /** Coupon id → how many users can claim in this phase, as typed. In the order they were added. */
  coupons: Record<string, string>;
}
type Errors = Partial<Record<'name' | 'start' | 'end' | 'coupons', string>> & { quantities?: Record<string, string> };

interface PhaseFormProps {
  /** Omit to create one. */
  phase?: Phase;
  /** Every phase, to warn about overlaps and name the phase a coupon is already in. */
  phases: Phase[];
  /** The whole coupon list: coupons are created there and picked from here. */
  coupons: Coupon[];
  brands: Brand[];
  onCancel: () => void;
  onSaved: (phase: Phase, created: boolean, couponCount: number) => void;
  onDirtyChange: (dirty: boolean) => void;
}

// Create / edit a phase on its own page: name and dates, then its coupons (picked from the coupon list in a modal) with how many of each users can claim.
export default function PhaseForm({ phase, phases, coupons, brands, onCancel, onSaved, onDirtyChange }: PhaseFormProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = useMemo<Draft>(
    () => ({
      name: phase?.name ?? '',
      start: toLocalParts(phase?.startDate).date,
      end: toLocalParts(phase?.endDate).date,
      coupons: Object.fromEntries(coupons.filter((c) => phase && c.phaseId === phase.id).map((c) => [c.id, String(claimLimit(c))])),
    }),
    // Only on open: a refresh of the coupon list mustn't reset what's been picked.
    [phase?.id],
  );
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [picking, setPicking] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const bothDates = Boolean(draft.start && draft.end);
  const endAfterStart = bothDates && draft.end > draft.start;
  const range = endAfterStart ? { startDate: startIso(draft.start), endDate: endIso(draft.end) } : null;
  const overlaps = range ? overlappingPhases(range, phases, phase?.id) : [];
  const days = endAfterStart ? phaseDurationDays(range!.startDate, range!.endDate) : 0;

  const byId = (id: string) => coupons.find((c) => c.id === id);
  const brandName = (c: Coupon) => brands.find((b) => b.id === c.brandId)?.name ?? '';
  // Expired before the phase opens, so users would never see it.
  const tooEarly = (c: Coupon, start = draft.start) => Boolean(start) && c.expiresAt < startIso(start);

  const validate = (d: Draft): Errors => {
    const e: Errors = {};
    if (!d.name.trim()) e.name = t('Enter a campaign name, e.g. “New Year 2027”.');
    else if (d.name.trim().length > NAME_MAX) e.name = t('Keep the name to {max} characters or fewer.', { max: NAME_MAX });
    if (!d.start) e.start = t('Pick the start date.');
    if (!d.end) e.end = t('Pick the end date.');
    else if (d.start && d.end <= d.start) e.end = t('The end date must be after the start date.');
    const quantities: Record<string, string> = {};
    for (const [id, text] of Object.entries(d.coupons)) {
      const c = byId(id);
      const err = c && quantityError(c, text, t);
      if (err) quantities[id] = err;
    }
    if (Object.keys(quantities).length) {
      e.quantities = quantities;
      e.coupons = t('Fix the quantities marked below.');
    } else if (Object.keys(d.coupons).some((id) => byId(id) && tooEarly(byId(id)!, d.start))) e.coupons = t('Remove coupons that expire before the campaign starts.');
    return e;
  };

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (submitted) setErrors(validate(next));
  };
  const setQuantity = (id: string, q: string) => update({ coupons: { ...draft.coupons, [id]: q } });
  const applyPicked = (items: CouponAllocation[]) => {
    update({ coupons: Object.fromEntries(items.map((a) => [a.couponId, String(a.quantity)])) });
    setPicking(false);
  };
  const takeOut = (id: string) => {
    const next = { ...draft.coupons };
    delete next[id];
    update({ coupons: next });
  };

  const errorCount = ['name', 'start', 'end', 'coupons'].filter((k) => errors[k as keyof Errors]).length;
  const scrollToFirstError = () => {
    const first = errors.name || errors.start || errors.end ? 'phase-details' : 'phase-coupons';
    document.getElementById(first)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const save = async () => {
    const next = validate(draft);
    setErrors(next);
    setSubmitted(true);
    setSaveError('');
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.getElementById(next.name || next.start || next.end ? 'phase-details' : 'phase-coupons')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return;
    }
    setSaving(true);
    try {
      const allocations = Object.entries(draft.coupons).map(([couponId, q]) => ({ couponId, quantity: Number(q) }));
      const saved = await couponApi.phases.save({ id: phase?.id, name: draft.name.trim(), startDate: startIso(draft.start), endDate: endIso(draft.end) }, allocations);
      onDirtyChange(false);
      onSaved(saved, !phase, allocations.length);
    } catch (e) {
      setSaveError(e instanceof CouponApiError ? e.message : t('Couldn’t save the campaign. Check your connection and try again.'));
      setSaving(false);
      rootRef.current?.closest('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const leave = () => (dirty ? setConfirmDiscard(true) : onCancel());

  const picked = Object.keys(draft.coupons)
    .map(byId)
    .filter((c): c is Coupon => Boolean(c));
  const usable = Object.values(draft.coupons).reduce((s, q) => s + (Number(q) > 0 ? Math.floor(Number(q)) : 0), 0);
  const summary = picked.length ? `${picked.length === 1 ? t('1 coupon') : t('{count} coupons', { count: picked.length })} · ${t('{count} usable', { count: fmt.number(usable) })}` : t('No coupons picked');
  // Grouped by brand, like the campaign page.
  const groups = brands
    .map((brand) => ({ brand, coupons: picked.filter((c) => c.brandId === brand.id).sort((a, b) => a.title.localeCompare(b.title, 'th')) }))
    .filter((g) => g.coupons.length)
    .sort((a, b) => a.brand.name.localeCompare(b.brand.name, 'th'));
  // The status each coupon will have once saved with these dates (it goes Active by itself while the campaign runs).
  const previewStatus = (c: Coupon): CouponDisplayStatus | null => {
    if (range) return couponStatus({ ...c, phaseId: PREVIEW_ID }, [{ id: PREVIEW_ID, name: '', status: 'draft', createdAt: '', ...range }]);
    return activationBlock(c) ?? (c.isActive ? null : 'inactive');
  };

  return (
    <div ref={rootRef} className="min-h-full flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 pb-8 lg:pb-10">
        <div className={`${CONTENT_WIDTH} mx-auto`}>
          <h1 className="text-2xl sm:text-[28px] font-semibold leading-tight text-[#1A1A1A]">{phase ? t('Edit campaign') : t('Create campaign')}</h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">{t('A time period that groups coupons, e.g. 1 Jan – 14 Feb.')}</p>
          <button
            type="button"
            onClick={leave}
            className="mt-4 inline-flex items-center gap-1.5 h-8 -ml-1 px-1 text-sm text-[#6B7280] rounded-md hover:text-[#FF6115] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:arrow-left-linear" width={16} height={16} />
            {t('Back to {page}', { page: phase ? phase.name : t('Campaigns') })}
          </button>

          {saveError && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
              <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
              {saveError}
            </p>
          )}

          <div className="mt-5 space-y-6">
            {/* 1. Name and dates */}
            <EventFormSection id="phase-details" icon="solar:calendar-linear" title={t('Campaign details')} description={t('Status is set automatically: Draft until the campaign has coupons, then Scheduled, Active or Ended by its dates.')}>
              <div className="grid gap-6 lg:grid-cols-2">
                <FormField label={t('Campaign name')} required error={errors.name}>
                  {(id) => (
                    <div>
                      <input
                        id={id}
                        value={draft.name}
                        maxLength={NAME_MAX}
                        onChange={(e) => update({ name: e.target.value })}
                        placeholder={t('e.g. {example}', { example: 'New Year 2027' })}
                        aria-invalid={Boolean(errors.name) || undefined}
                        aria-describedby={`${id}-count`}
                        className={inputClass(Boolean(errors.name))}
                      />
                      <p id={`${id}-count`} className="mt-1 text-right text-xs text-[#9CA3AF] tabular-nums">
                        {draft.name.length}/{NAME_MAX}
                      </p>
                    </div>
                  )}
                </FormField>

                <FormField label={t('Dates')} required error={errors.start ?? errors.end} asGroup>
                  {() => (
                    <div className="space-y-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                        <PickerInput type="date" size="md" value={draft.start} max={draft.end || undefined} onChange={(start) => update({ start })} placeholder={t('Start date')} invalid={Boolean(errors.start)} />
                        <Icon icon="solar:arrow-right-linear" width={14} height={14} className="text-[#9CA3AF]" aria-hidden="true" />
                        <PickerInput type="date" size="md" value={draft.end} min={draft.start || undefined} onChange={(end) => update({ end })} placeholder={t('End date')} invalid={Boolean(errors.end)} />
                      </div>

                      {/* Live as dates are picked. */}
                      <div aria-live="polite" className="space-y-2">
                        {endAfterStart ? (
                          <p className="flex items-center gap-2 text-sm text-[#374151]">
                            <Icon icon="solar:calendar-linear" width={16} height={16} className="text-[#6B7280] flex-shrink-0" />
                            <span>
                              <span className="font-semibold">{days === 1 ? t('1 day') : t('{count} days', { count: fmt.number(days) })}</span>
                              <span className="text-[#6B7280]"> · {fmt.date(range!.startDate)} – {fmt.date(range!.endDate)}</span>
                            </span>
                          </p>
                        ) : bothDates && !errors.end ? (
                          <p className="text-sm text-[#DC2626]">{t('The end date must be after the start date.')}</p>
                        ) : !bothDates ? (
                          <p className="text-sm text-[#9CA3AF]">{t('Pick both dates to see the duration.')}</p>
                        ) : null}

                        {overlaps.length > 0 && (
                          <div className="flex items-start gap-2 rounded-xl bg-[#FFFBEB] px-3 py-2.5 text-sm text-[#B45309]">
                            <Icon icon="solar:danger-triangle-linear" width={16} height={16} className="mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{t('These dates overlap with another campaign. You can still save.')}</p>
                              <ul className="mt-1 space-y-0.5">
                                {overlaps.map((p) => (
                                  <li key={p.id}>
                                    {p.name} <span className="text-[#B45309]/80">({fmt.date(p.startDate)} – {fmt.date(p.endDate)})</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </FormField>
              </div>
            </EventFormSection>

            {/* 2. Coupons in this campaign: same layout as the campaign page, picked from the coupon list in a modal. */}
            <section id="phase-coupons" aria-labelledby="phase-coupons-title" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 id="phase-coupons-title" className="text-[15px] font-semibold text-[#1A1A1A]">
                    {t('Coupons in this campaign')}
                  </h2>
                  <p aria-live="polite" className="text-xs text-[#6B7280] mt-0.5">
                    {couponsAcrossBrands(t, picked.length, groups.length)}
                    {picked.length > 0 && <> · {t('{count} usable', { count: fmt.number(usable) })}</>}
                  </p>
                </div>
                {picked.length > 0 && (
                  <Button variant="secondary" pill icon="solar:add-linear" onClick={() => setPicking(true)} className="whitespace-nowrap">
                    {t('Add coupons')}
                  </Button>
                )}
              </div>

              {errors.coupons && (
                <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
                  <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
                  {errors.coupons}
                </p>
              )}

              {picked.length === 0 ? (
                <StateBox icon="solar:ticket-sale-linear" title={t('No coupons in this campaign yet')} text={t('Add coupons you’ve created on the Coupon list. The campaign shows as Draft until it has at least one.')}>
                  <Button icon="solar:add-linear" onClick={() => setPicking(true)}>
                    {t('Add coupons to this campaign')}
                  </Button>
                </StateBox>
              ) : (
                <div className="mt-4 overflow-x-auto border-b border-[#E5E7EB]">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                        <th scope="col" className="h-11 pl-4 px-3">{t('Coupon')}</th>
                        <th scope="col" className="px-3">{t('Status')}</th>
                        <th scope="col" className="px-3">{t('Usable in this campaign')}</th>
                        <th scope="col" className="px-3">{t('Expires')}</th>
                        <th scope="col" className="px-3 pr-4">
                          <span className="sr-only">{t('Actions')}</span>
                        </th>
                      </tr>
                    </thead>
                    {groups.map(({ brand, coupons: own }) => (
                      <tbody key={brand.id} className="text-[13px] text-[#374151]">
                        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
                          <th scope="rowgroup" colSpan={5} className="pl-4 px-3 py-2.5 text-left font-normal">
                            <span className="inline-flex items-center gap-2.5">
                              <img src={brand.logoUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-[#E5E7EB]" />
                              <span className="text-sm font-semibold text-[#1A1A1A]">{brand.name}</span>
                              <span className="text-xs text-[#6B7280]">{own.length === 1 ? t('1 coupon') : t('{count} coupons', { count: own.length })}</span>
                            </span>
                          </th>
                        </tr>
                        {own.map((c) => {
                          const error = submitted ? errors.quantities?.[c.id] : undefined;
                          const qtyId = `phase-qty-${c.id}`;
                          const locked = c.claimedCount > 0;
                          const status = previewStatus(c);
                          return (
                            <tr key={c.id} className="border-t border-[#F0F0F0] align-top">
                              <td className="pl-8 px-3 py-3 max-w-[300px]">
                                <p className="text-sm font-medium text-[#1A1A1A] break-words">{c.title}</p>
                                {locked && <p className="text-xs text-[#6B7280]">{t('{count} claimed', { count: fmt.number(c.claimedCount) })}</p>}
                                {tooEarly(c) && <p className="text-xs text-[#B45309]">{t('Expires before this campaign starts, so users would never see it.')}</p>}
                              </td>
                              <td className="px-3 py-3">{status ? <CouponStatusBadge status={status} /> : <span className="text-[#9CA3AF]">—</span>}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    id={qtyId}
                                    type="number"
                                    inputMode="numeric"
                                    min={minQuantity(c)}
                                    max={c.totalQuantity}
                                    step={1}
                                    value={draft.coupons[c.id]}
                                    onChange={(e) => setQuantity(c.id, e.target.value)}
                                    aria-label={t('Usable in this campaign: {name}', { name: c.title })}
                                    aria-invalid={Boolean(error) || undefined}
                                    aria-describedby={`${qtyId}-of${error ? ` ${qtyId}-error` : ''}`}
                                    className={`w-28 h-9 px-2.5 text-sm text-right tabular-nums text-[#1A1A1A] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] ${error ? 'border-[#DC2626]' : 'border-[#E5E7EB]'}`}
                                  />
                                  <span id={`${qtyId}-of`} className="text-xs text-[#6B7280] whitespace-nowrap">
                                    {t('of {total}', { total: fmt.number(c.totalQuantity) })}
                                  </span>
                                </div>
                                {error && (
                                  <p id={`${qtyId}-error`} className="mt-1 text-xs text-[#DC2626]">
                                    {error}
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">{fmt.dateTime(c.expiresAt)}</td>
                              <td className="px-3 pr-4 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => takeOut(c.id)}
                                  disabled={locked}
                                  title={locked ? t('Users have claimed this coupon, so it stays in the campaign. Turn it off instead.') : undefined}
                                  aria-label={t('Remove {name} from this campaign', { name: c.title })}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#DC2626] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#6B7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                                >
                                  <Icon icon="solar:minus-circle-linear" width={18} height={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    ))}
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <StickyActionBar
        maxWidth={CONTENT_WIDTH}
        note={
          errorCount > 0 ? (
            <button type="button" onClick={scrollToFirstError} className="inline-flex items-center gap-1.5 text-[#DC2626] font-medium hover:underline underline-offset-2">
              <Icon icon="solar:danger-circle-linear" width={16} height={16} className="flex-shrink-0" />
              {errorCount === 1 ? t('1 field needs attention') : t('{count} fields need attention', { count: errorCount })}
            </button>
          ) : (
            <span>{summary}</span>
          )
        }
        tertiary={{ label: t('Cancel'), onClick: leave, disabled: saving }}
        primary={{ label: saving ? t('Saving…') : phase ? t('Save changes') : t('Save campaign'), onClick: save, disabled: saving }}
      />

      {picking && (
        <CouponPickerModal
          phaseName={draft.name.trim()}
          phaseId={phase?.id}
          startDate={startIso(draft.start)}
          coupons={coupons}
          brands={brands}
          phases={phases}
          // Typed quantities that aren't numbers yet start from the whole quantity.
          value={picked.map((c) => ({ couponId: c.id, quantity: Number(draft.coupons[c.id]) || c.totalQuantity }))}
          confirmLabel={t('Done')}
          onClose={() => setPicking(false)}
          onSave={applyPicked}
        />
      )}

      {confirmDiscard && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved changes to this campaign will be lost.')}
          onConfirm={() => {
            onDirtyChange(false);
            onCancel();
          }}
          onClose={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  );
}
