import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import Toggle from '../../../components/ui/Toggle';
import PickerInput from '../../../components/ui/PickerInput';
import FilterSelect from '../../../components/ui/FilterSelect';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import SelectField from '../../../components/set-event/form/SelectField';
import {
  AUTO_HIDE_REASON_LABELS,
  BRAND_CONTACT_FIELDS,
  isContractEnded,
  partnerLogoStatus,
  claimLimit,
  remainingStock,
  type Brand,
  type BrandProfile,
  type Coupon,
  type CouponUser,
  type Phase,
} from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import { useCan } from '../CouponRoleContext';
import { toLocalParts, useCouponFormat } from '../format';
import { useT } from '@/i18n';

const LOGO_TYPES = ['image/jpeg', 'image/png'];
const LOGO_MAX_MB = 2;
const ALL_PHASES = 'All campaigns';

interface Draft {
  name: string;
  logoUrl: string;
  isPartnerActive: boolean;
  partnerStart: string;
  partnerEnd: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  ownerBdId: string;
}
type Errors = Partial<Record<keyof Draft, string>>;

const toDraft = (b: Brand): Draft => ({
  name: b.name,
  logoUrl: b.logoUrl,
  isPartnerActive: b.isPartnerActive,
  partnerStart: toLocalParts(b.partnerStartDate).date,
  partnerEnd: toLocalParts(b.partnerEndDate).date,
  contactName: b.contactName ?? '',
  contactPhone: b.contactPhone ?? '',
  contactEmail: b.contactEmail ?? '',
  ownerBdId: b.ownerBdId ?? '',
});

/** Empty text clears the field. Dates cover whole days: start of the first, end of the last. */
function toProfile(d: Draft): Partial<BrandProfile> {
  const opt = (s: string) => s.trim() || undefined;
  return {
    name: d.name.trim(),
    logoUrl: d.logoUrl,
    isPartnerActive: d.isPartnerActive,
    partnerStartDate: d.partnerStart ? new Date(`${d.partnerStart}T00:00:00`).toISOString() : undefined,
    partnerEndDate: d.partnerEnd ? new Date(`${d.partnerEnd}T23:59:59.999`).toISOString() : undefined,
    contactName: opt(d.contactName),
    contactPhone: opt(d.contactPhone),
    contactEmail: opt(d.contactEmail),
    ownerBdId: opt(d.ownerBdId),
  };
}

interface BrandOverviewProps {
  brand: Brand;
  /** This brand's coupons, every phase. */
  coupons: Coupon[];
  phases: Phase[];
  bdUsers: CouponUser[];
  onSaved: (brand: Brand) => void;
  onDirtyChange: (dirty: boolean) => void;
  onToast: (message: string) => void;
}

// Overview: the brand's profile (Admin edits all of it, BD the contacts and owner) and its numbers.
export default function BrandOverview({ brand, coupons, phases, bdUsers, onSaved, onDirtyChange, onToast }: BrandOverviewProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const canEditBrand = useCan('brand.write');
  const canEditContacts = useCan('brandContact.write');
  const initial = useMemo(() => toDraft(brand), [brand]);
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [logoError, setLogoError] = useState('');
  const logoInput = useRef<HTMLInputElement>(null);
  const [phaseName, setPhaseName] = useState(ALL_PHASES);

  useEffect(() => setDraft(initial), [initial]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !(k in patch))));
  };

  const validate = (d: Draft): Errors => {
    const e: Errors = {};
    if (!d.name.trim()) e.name = t('Enter the partner name.');
    if (d.partnerStart && d.partnerEnd && d.partnerEnd <= d.partnerStart) e.partnerEnd = t('The partner end date must be after the start date.');
    if (d.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contactEmail.trim())) e.contactEmail = t('Enter a valid email, e.g. name@brand.com.');
    if (d.contactPhone.trim() && !/^[+\d][\d\s-]{6,}$/.test(d.contactPhone.trim())) e.contactPhone = t('Enter a phone number using digits, spaces or dashes.');
    return e;
  };

  const save = async () => {
    const next = validate(draft);
    setErrors(next);
    setSaveError('');
    if (Object.keys(next).length) return;
    // Send only what changed, and only what this role may change.
    const before = toProfile(initial);
    const after = toProfile(draft);
    const patch = Object.fromEntries(
      (Object.keys(after) as (keyof BrandProfile)[])
        .filter((k) => before[k] !== after[k])
        .filter((k) => canEditBrand || (BRAND_CONTACT_FIELDS as readonly string[]).includes(k))
        .map((k) => [k, after[k]]),
    ) as Partial<BrandProfile>;
    setSaving(true);
    try {
      const saved = await couponApi.brands.update(brand.id, patch);
      onDirtyChange(false);
      onSaved(saved);
      onToast(t('Partner saved.'));
    } catch (e) {
      setSaveError(e instanceof CouponApiError ? e.message : t('Couldn’t save the partner. Check your connection and try again.'));
    } finally {
      setSaving(false);
    }
  };

  const pickLogo = (file: File | undefined) => {
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) return setLogoError(t('Only JPEG and PNG images are supported.'));
    if (file.size > LOGO_MAX_MB * 1024 * 1024) return setLogoError(t('The file is larger than {size}MB.', { size: LOGO_MAX_MB }));
    setLogoError('');
    couponApi.brands
      .uploadLogo(file)
      .then((f) => update({ logoUrl: f.url }))
      .catch(() => setLogoError(t('Upload failed. Check your connection and try again.')));
  };

  // Numbers, optionally for one phase.
  const phase = phases.find((p) => p.name === phaseName);
  const scoped = phase ? coupons.filter((c) => c.phaseId === phase.id) : coupons;
  const claimed = scoped.reduce((s, c) => s + c.claimedCount, 0);
  const redeemed = scoped.reduce((s, c) => s + c.redeemedCount, 0);
  const total = scoped.reduce((s, c) => s + claimLimit(c), 0);
  const remaining = scoped.reduce((s, c) => s + remainingStock(c), 0);
  const views = scoped.reduce((s, c) => s + c.viewCount, 0);
  const viewers = scoped.reduce((s, c) => s + c.viewerCount, 0);
  const phaseOptions = [ALL_PHASES, ...phases.filter((p) => coupons.some((c) => c.phaseId === p.id)).map((p) => p.name)];

  const inApp = partnerLogoStatus(brand, coupons, phases);
  const ended = isContractEnded(brand);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 sm:gap-6 items-start">
      <section aria-labelledby="brand-profile-title" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <header className="px-4 sm:px-6 pt-5 pb-4 border-b border-[#F0F0F0]">
          <h2 id="brand-profile-title" className="text-[15px] font-semibold text-[#1A1A1A]">
            {t('Partner profile')}
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {canEditBrand ? t('Everything about this partner is edited here.') : t('Only Admins can change the name, logo and partner details. You can update the contacts and owner.')}
          </p>
        </header>

        <div className="px-4 sm:px-6 py-5 space-y-6">
          {saveError && (
            <p role="alert" className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
              {saveError}
            </p>
          )}

          {/* Admin only */}
          <fieldset disabled={!canEditBrand} className="min-w-0 space-y-5">
            <div className="flex items-center gap-4">
              <img src={draft.logoUrl} alt={t('{name} logo', { name: brand.name })} className="w-16 h-16 rounded-full object-cover border border-[#E5E7EB] flex-shrink-0" />
              {canEditBrand && (
                <div>
                  <Button variant="secondary" pill onClick={() => logoInput.current?.click()}>
                    {t('Change logo')}
                  </Button>
                  <p className="mt-1 text-xs text-[#9CA3AF]">{t('Square, at least 240 × 240 px. JPEG or PNG, up to 2MB.')}</p>
                  {logoError && <p className="mt-1 text-xs text-[#DC2626]">{logoError}</p>}
                  <input
                    ref={logoInput}
                    type="file"
                    hidden
                    accept={LOGO_TYPES.join(',')}
                    onChange={(e) => {
                      pickLogo(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </div>
              )}
            </div>

            <FormField label={t('Partner name')} required error={errors.name}>
              {(id) => <input id={id} value={draft.name} maxLength={80} onChange={(e) => update({ name: e.target.value })} aria-invalid={Boolean(errors.name) || undefined} className={inputClass(Boolean(errors.name))} />}
            </FormField>

            <FormField
              label={t('Partner')}
              hint={ended ? t('The contract ended on {date}, so the partner shows as Contract ended even when this is on.', { date: fmt.date(brand.partnerEndDate!) }) : t('Turn off to hide the partner’s logo from the app.')}
              asGroup
            >
              {() => <Toggle checked={draft.isPartnerActive} onChange={(isPartnerActive) => update({ isPartnerActive })} label={draft.isPartnerActive ? t('Active partner') : t('Partner inactive')} disabled={!canEditBrand} />}
            </FormField>

            <FormField label={t('Partner period')} hint={t('Optional. After the end date the partner shows as Contract ended.')} error={errors.partnerEnd} asGroup>
              {() => (
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 max-w-md">
                  <PickerInput type="date" size="md" value={draft.partnerStart} onChange={(partnerStart) => update({ partnerStart })} placeholder={t('Start date')} />
                  <Icon icon="solar:arrow-right-linear" width={14} height={14} className="text-[#9CA3AF]" aria-hidden="true" />
                  <PickerInput type="date" size="md" value={draft.partnerEnd} min={draft.partnerStart || undefined} onChange={(partnerEnd) => update({ partnerEnd })} placeholder={t('End date')} invalid={Boolean(errors.partnerEnd)} />
                </div>
              )}
            </FormField>
          </fieldset>

          {/* Admin and BD */}
          <fieldset disabled={!canEditContacts} className="min-w-0 pt-5 border-t border-[#F0F0F0] grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('Contact name')}>
              {(id) => <input id={id} value={draft.contactName} onChange={(e) => update({ contactName: e.target.value })} placeholder={t('e.g. {example}', { example: 'คุณมาลี ศรีสุข' })} className={inputClass()} />}
            </FormField>
            <FormField label={t('Contact phone')} error={errors.contactPhone}>
              {(id) => (
                <input
                  id={id}
                  type="tel"
                  inputMode="tel"
                  value={draft.contactPhone}
                  onChange={(e) => update({ contactPhone: e.target.value })}
                  placeholder="081-234-5678"
                  aria-invalid={Boolean(errors.contactPhone) || undefined}
                  className={inputClass(Boolean(errors.contactPhone))}
                />
              )}
            </FormField>
            <FormField label={t('Contact email')} error={errors.contactEmail}>
              {(id) => (
                <input
                  id={id}
                  type="email"
                  inputMode="email"
                  value={draft.contactEmail}
                  onChange={(e) => update({ contactEmail: e.target.value })}
                  placeholder="name@brand.com"
                  aria-invalid={Boolean(errors.contactEmail) || undefined}
                  className={inputClass(Boolean(errors.contactEmail))}
                />
              )}
            </FormField>
            <FormField label={t('Owner BD')}>
              {(id) => (
                <SelectField
                  id={id}
                  value={draft.ownerBdId || 'none'}
                  options={[{ value: 'none', label: t('No owner') }, ...bdUsers.map((u) => ({ value: u.id, label: u.name }))]}
                  onChange={(v) => update({ ownerBdId: v === 'none' ? '' : v })}
                  placeholder={t('Select owner')}
                  icon="solar:user-circle-linear"
                />
              )}
            </FormField>
          </fieldset>
        </div>

        {canEditContacts && (
          <footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t border-[#F0F0F0]">
            {dirty && <span className="sm:mr-auto text-xs font-medium text-[#E5540F]">{t('Unsaved changes')}</span>}
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(initial);
                setErrors({});
              }}
              disabled={!dirty || saving}
            >
              {t('Discard')}
            </Button>
            <Button onClick={save} disabled={!dirty || saving}>
              {saving ? t('Saving…') : t('Save changes')}
            </Button>
          </footer>
        )}
      </section>

      <div className="space-y-4 sm:space-y-6 min-w-0">
        <section aria-labelledby="brand-numbers-title" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="brand-numbers-title" className="text-[15px] font-semibold text-[#1A1A1A]">
              {t('Numbers')}
            </h2>
            <FilterSelect label={t('Campaign')} value={t(phaseName)} options={phaseOptions.map((o) => t(o))} onChange={(v) => setPhaseName(phaseOptions.find((o) => t(o) === v) ?? ALL_PHASES)} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Kpi label={t('Claimed')} value={fmt.number(claimed)} sub={t('of {total}', { total: fmt.number(total) })} />
            <Kpi label={t('Redeemed')} value={fmt.number(redeemed)} />
            <Kpi label={t('Redemption rate')} value={claimed ? fmt.percent(redeemed / claimed) : '—'} sub={t('of claimed')} />
            <Kpi label={t('Remaining')} value={fmt.number(remaining)} />
            <Kpi label={t('Viewers')} value={fmt.number(viewers)} sub={t('{count} views', { count: fmt.number(views) })} />
            <Kpi label={t('Viewer → claim')} value={viewers ? fmt.percent(Math.min(1, claimed / viewers)) : '—'} sub={t('of viewers')} />
          </dl>
          <p className="mt-3 text-xs text-[#9CA3AF]">{scoped.length === 1 ? t('All time, from 1 coupon.') : t('All time, across {count} coupons.', { count: scoped.length })}</p>
        </section>

        <section aria-labelledby="brand-app-title" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-5">
          <h2 id="brand-app-title" className="text-[15px] font-semibold text-[#1A1A1A]">
            {t('In the app')}
          </h2>
          <p className={`mt-2 flex items-start gap-2 text-sm ${inApp.status === 'visible' ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
            <Icon icon={inApp.status === 'visible' ? 'solar:check-circle-linear' : 'solar:eye-closed-linear'} width={18} height={18} className="mt-0.5 flex-shrink-0" />
            {inApp.status === 'visible'
              ? t('The logo shows in "Partner with PEEPS".')
              : inApp.status === 'hidden'
                ? t('The logo is hidden: the partner switch is off.')
                : t('The logo is hidden: {reason}.', { reason: t(AUTO_HIDE_REASON_LABELS[inApp.reason]).toLowerCase() })}
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">{t('Shown only for an active partner whose contract hasn’t ended, with at least one live coupon.')}</p>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5">
      <dt className="text-xs font-medium text-[#6B7280]">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold text-[#1A1A1A] leading-tight">{value}</dd>
      {sub && <dd className="text-xs text-[#9CA3AF]">{sub}</dd>}
    </div>
  );
}
