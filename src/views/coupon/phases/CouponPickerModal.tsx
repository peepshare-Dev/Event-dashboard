import { useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import SearchInput from '../../../components/ui/SearchInput';
import FilterSelect from '../../../components/ui/FilterSelect';
import { activationBlock, type Brand, type Coupon, type Phase } from '../../../data/coupons';
import type { CouponAllocation } from '../../../data/mock/couponApi';
import CouponStatusBadge from '../CouponStatusBadge';
import { useCouponFormat } from '../format';
import { useT } from '@/i18n';

const ALL_BRANDS = 'All partners';

/** At least what's already been claimed (and at least 1), at most the coupon's total quantity. Same rule the server checks. */
export const minQuantity = (c: Coupon) => Math.max(1, c.claimedCount);

/** Why a typed quantity can't be saved, or '' if it can. */
export function quantityError(c: Coupon, text: string, t: ReturnType<typeof useT>): string {
  const n = Number(text);
  if (!text.trim()) return t('Enter how many users can claim.');
  if (!Number.isInteger(n) || n < minQuantity(c) || n > c.totalQuantity) return t('Enter a whole number from {min} to {max}.', { min: minQuantity(c), max: c.totalQuantity });
  return '';
}

interface CouponPickerModalProps {
  /** For the title. Empty while a new phase has no name yet. */
  phaseName: string;
  /** The phase being edited; omit for a new one. */
  phaseId?: string;
  /** The phase's first instant; coupons that expire before it can't be added. Empty until a start date is chosen. */
  startDate: string;
  /** The whole coupon list. */
  coupons: Coupon[];
  brands: Brand[];
  phases: Phase[];
  /** The phase's coupons as they are now, with how many of each can be claimed. */
  value: CouponAllocation[];
  confirmLabel: string;
  onClose: () => void;
  /** Gets the phase's whole coupon set. Rejects with a message to show. */
  onSave: (all: CouponAllocation[]) => Promise<void> | void;
}

// Coupon list (left) → this phase's coupons with how many users can claim (right), e.g. ice cream shop: 100.
export default function CouponPickerModal({ phaseName, phaseId, startDate, coupons, brands, phases, value, confirmLabel, onClose, onSave }: CouponPickerModalProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState(ALL_BRANDS);
  /** Coupon id → quantity as typed. In the order they were added. */
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(value.map((a) => [a.couponId, String(a.quantity)])));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const byId = (id: string) => coupons.find((c) => c.id === id);
  const brandName = (c: Coupon) => brands.find((b) => b.id === c.brandId)?.name ?? '';
  const otherPhase = (c: Coupon) => (c.phaseId && c.phaseId !== phaseId ? phases.find((p) => p.id === c.phaseId) : undefined);
  // Expired before the phase opens, so users would never see it.
  const tooEarly = (c: Coupon) => Boolean(startDate) && c.expiresAt < startDate;

  const term = search.trim().toLowerCase();
  const brandOptions = [ALL_BRANDS, ...brands.filter((b) => coupons.some((c) => c.brandId === b.id)).map((b) => b.name)];
  // Ones that can be added first, then ones in another phase.
  const rank = (c: Coupon) => (otherPhase(c) ? 2 : tooEarly(c) ? 1 : 0);
  const listed = coupons
    .filter((c) => brandFilter === ALL_BRANDS || brandName(c) === brandFilter)
    .filter((c) => !term || `${c.title} ${brandName(c)}`.toLowerCase().includes(term))
    .sort((a, b) => rank(a) - rank(b) || brandName(a).localeCompare(brandName(b), 'th') || a.title.localeCompare(b.title, 'th'));
  const inPhase = Object.keys(picked)
    .map(byId)
    .filter((c): c is Coupon => Boolean(c));

  const add = (c: Coupon) => setPicked((p) => ({ ...p, [c.id]: String(c.totalQuantity - c.claimedCount || c.totalQuantity) }));
  const remove = (id: string) =>
    setPicked((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });

  const errors = Object.fromEntries(
    inPhase.map((c) => [c.id, quantityError(c, picked[c.id], t)] as const).filter(([, e]) => e),
  );
  const usable = Object.values(picked).reduce((s, q) => s + (Number(q) > 0 ? Math.floor(Number(q)) : 0), 0);
  const summary = inPhase.length ? `${inPhase.length === 1 ? t('1 coupon') : t('{count} coupons', { count: inPhase.length })} · ${t('{count} usable', { count: fmt.number(usable) })}` : t('No coupons picked');

  const save = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    setSaving(true);
    setError('');
    try {
      await onSave(inPhase.map((c) => ({ couponId: c.id, quantity: Number(picked[c.id]) })));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={phaseName ? t('Coupons in {phase}', { phase: phaseName }) : t('Coupons in this campaign')}
      onClose={onClose}
      maxWidth="sm:max-w-6xl"
      footer={
        <>
          <span aria-live="polite" className="order-last sm:order-none sm:mr-auto self-center text-xs sm:text-sm text-[#6B7280]">
            {error ? <span className="text-[#DC2626]">{error}</span> : submitted && Object.keys(errors).length ? <span className="text-[#DC2626]">{t('Fix the quantities marked in red.')}</span> : summary}
          </span>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t('Cancel')}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? t('Saving…') : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-[#6B7280]">{t('Pick coupons from the coupon list and set how many of each users can claim in this campaign. A coupon belongs to one campaign at a time.')}</p>
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* Coupon list */}
        <section aria-labelledby="picker-coupon-list" className="min-w-0 rounded-xl border border-[#E5E7EB] flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-[#F0F0F0] space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h4 id="picker-coupon-list" className="text-sm font-semibold text-[#1A1A1A]">
                {t('Coupon list')}
              </h4>
              <span className="text-xs text-[#6B7280]">{t('{count} coupons', { count: fmt.number(listed.length) })}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <SearchInput value={search} onChange={setSearch} placeholder={t('Search title or partner')} className="flex-1 min-w-0" />
              <FilterSelect label={t('Partner')} value={brandFilter} options={brandOptions} onChange={setBrandFilter} />
            </div>
          </div>
          {listed.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[#6B7280]">{coupons.length ? t('No coupons match your search.') : t('No coupons yet. Create them on the Coupon list first.')}</p>
          ) : (
            <ul className="divide-y divide-[#F0F0F0] max-h-[52vh] overflow-y-auto">
              {listed.map((c) => {
                const added = c.id in picked;
                const elsewhere = otherPhase(c);
                const early = tooEarly(c);
                return (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <img src={c.couponImageUrl} alt="" className="w-11 h-11 rounded-lg object-cover bg-[#F3F4F6] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] break-words">{c.title}</p>
                      <p className="text-xs text-[#6B7280]">
                        {brandName(c)} · {t('Quantity {count}', { count: fmt.number(c.totalQuantity) })} · {t('Expires {date}', { date: fmt.date(c.expiresAt) })}
                      </p>
                      {elsewhere ? (
                        <p className="text-xs text-[#6B7280]">{t('In {phase}', { phase: elsewhere.name })}</p>
                      ) : early && !added ? (
                        <p className="text-xs text-[#B45309]">{t('Expires before this campaign starts, so users would never see it.')}</p>
                      ) : null}
                    </div>
                    {added ? (
                      <span className="inline-flex items-center gap-1 h-8 px-2 text-xs font-medium text-[#15803D] whitespace-nowrap">
                        <Icon icon="solar:check-circle-linear" width={16} height={16} />
                        {t('Added')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => add(c)}
                        disabled={Boolean(elsewhere) || early}
                        aria-label={t('Add {name} to this campaign', { name: c.title })}
                        className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] whitespace-nowrap hover:border-[#FF6115] hover:text-[#FF6115] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E5E7EB] disabled:hover:text-[#374151] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                      >
                        <Icon icon="solar:add-linear" width={14} height={14} />
                        {t('Add')}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* In this campaign */}
        <section aria-labelledby="picker-in-phase" className="min-w-0 rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-[#F0F0F0] flex items-baseline justify-between gap-2">
            <h4 id="picker-in-phase" className="text-sm font-semibold text-[#1A1A1A]">
              {t('In this campaign')}
            </h4>
            <span className="text-xs text-[#6B7280]">{summary}</span>
          </div>
          {inPhase.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-14 text-center">
              <Icon icon="solar:ticket-sale-linear" width={28} height={28} className="text-[#9CA3AF]" />
              <p className="mt-2 text-sm font-semibold text-[#1A1A1A]">{t('No coupons yet')}</p>
              <p className="mt-1 text-sm text-[#6B7280] max-w-xs">{t('Add coupons from the coupon list. The campaign stays a draft until it has at least one.')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F0F0F0] max-h-[52vh] overflow-y-auto">
              {inPhase.map((c) => {
                const qtyError = submitted ? errors[c.id] : '';
                const qtyId = `pick-qty-${c.id}`;
                const locked = c.claimedCount > 0;
                const block = activationBlock(c);
                return (
                  <li key={c.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.couponImageUrl} alt="" className="w-11 h-11 rounded-lg object-cover bg-[#F3F4F6] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] break-words">{c.title}</p>
                        <p className="text-xs text-[#6B7280]">
                          {brandName(c)}
                          {locked && <> · {t('{count} claimed', { count: fmt.number(c.claimedCount) })}</>}
                        </p>
                        {tooEarly(c) && <p className="text-xs text-[#B45309]">{t('Expires before this campaign starts, so users would never see it.')}</p>}
                      </div>
                      {/* Only what keeps it out of the app; otherwise it goes Active by itself while the campaign runs. */}
                      {(!c.isActive || block) && <CouponStatusBadge status={block ?? 'inactive'} />}
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        disabled={locked}
                        title={locked ? t('Users have claimed this coupon, so it stays in the campaign. Turn it off instead.') : undefined}
                        aria-label={t('Remove {name} from this campaign', { name: c.title })}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#DC2626] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#6B7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 flex-shrink-0"
                      >
                        <Icon icon="solar:close-circle-linear" width={18} height={18} />
                      </button>
                    </div>
                    <div className="mt-2 pl-14 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <label htmlFor={qtyId} className="text-xs font-medium text-[#374151]">
                        {t('Usable in this campaign')}
                      </label>
                      <input
                        id={qtyId}
                        type="number"
                        inputMode="numeric"
                        min={minQuantity(c)}
                        max={c.totalQuantity}
                        step={1}
                        value={picked[c.id]}
                        onChange={(e) => setPicked((p) => ({ ...p, [c.id]: e.target.value }))}
                        aria-invalid={Boolean(qtyError) || undefined}
                        aria-describedby={`${qtyId}-of${qtyError ? ` ${qtyId}-error` : ''}`}
                        className={`w-28 h-9 px-2.5 text-sm text-right tabular-nums text-[#1A1A1A] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] ${qtyError ? 'border-[#DC2626]' : 'border-[#E5E7EB]'}`}
                      />
                      <span id={`${qtyId}-of`} className="text-xs text-[#6B7280]">
                        {t('of {total}', { total: fmt.number(c.totalQuantity) })}
                      </span>
                      {qtyError && (
                        <p id={`${qtyId}-error`} className="basis-full text-xs text-[#DC2626]">
                          {qtyError}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  );
}
