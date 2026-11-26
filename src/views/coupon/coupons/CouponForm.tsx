import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import EventFormSection from '../../../components/set-event/form/EventFormSection';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import SearchSelect, { type SearchSelectItem } from '../../../components/set-event/form/SearchSelect';
import StickyActionBar from '../../../components/set-event/form/StickyActionBar';
import BannerDropzone, { type BannerFile } from '../../../components/set-event/BannerDropzone';
import RichTextEditor from '../../../components/set-event/RichTextEditor';
import PickerInput from '../../../components/ui/PickerInput';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import { activationBlock, BRAND_PARTNER_STATUS_LABELS, brandPartnerStatus, isBarcodeValue, type Brand, type Coupon, type CouponCodeType, type Phase } from '../../../data/coupons';
import { couponApi, CouponApiError, type CouponInput } from '../../../data/mock/couponApi';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import CouponCodeField, { type CodeFile } from './CouponCodeField';
import CouponAppPreview from './CouponAppPreview';
import CouponViewersPanel from './CouponViewersPanel';
import PhaseStatusBadge from '../phases/PhaseStatusBadge';
import AddBrandModal from '../brands/AddBrandModal';
import { useCan } from '../CouponRoleContext';
import { fromLocalParts, toLocalParts, useCouponFormat } from '../format';
import { useT } from '@/i18n';

const CONTENT_WIDTH = 'max-w-[1200px]';
const IMAGE_MAX_MB = 2;

interface Draft {
  title: string;
  brandId: string;
  image: BannerFile | null;
  conditionsHtml: string;
  codeType: CouponCodeType;
  barcode: string;
  codeFile: CodeFile | null;
  quantity: string;
  expiryDate: string;
  expiryTime: string;
}

function toDraft(c?: Coupon): Draft {
  const expiry = toLocalParts(c?.expiresAt);
  return {
    title: c?.title ?? '',
    brandId: c?.brandId ?? '',
    image: c ? { url: c.couponImageUrl, name: c.title } : null,
    conditionsHtml: c ? sanitizeHtml(c.conditionsHtml) : '',
    codeType: c?.codeType ?? 'single',
    barcode: c?.barcode ?? '',
    codeFile: c?.uniqueCodes ? { name: '', parsed: { codes: c.uniqueCodes, duplicates: [], invalidRows: [] } } : null,
    quantity: c ? String(c.totalQuantity) : '',
    expiryDate: expiry.date,
    expiryTime: expiry.time,
  };
}

/** 'activate' adds the checks that only matter for a coupon that will be live. */
type SaveMode = 'draft' | 'activate';
type ErrorKey = 'title' | 'brandId' | 'image' | 'barcode' | 'codes' | 'quantity' | 'expiry';
type Errors = Partial<Record<ErrorKey, string>>;
type Translate = ReturnType<typeof useT>;

const quantityOf = (d: Draft) => (d.codeType === 'unique' ? (d.codeFile?.parsed.codes.length ?? 0) : Number(d.quantity));

function validate(d: Draft, mode: SaveMode, ctx: { phase?: Phase; claimed: number; t: Translate; fmt: ReturnType<typeof useCouponFormat> }): Errors {
  const { phase, claimed, t, fmt } = ctx;
  const e: Errors = {};
  if (!d.title.trim()) e.title = t('Enter a coupon title, e.g. “ลด 100.-”.');
  if (!d.brandId) e.brandId = t('Choose a partner, or add a new one.');
  if (!d.image) e.image = t('Upload the coupon image (JPG or PNG, up to {size}MB).', { size: IMAGE_MAX_MB });

  if (d.codeType === 'single') {
    if (!d.barcode.trim()) e.barcode = t('Enter the barcode value the store will scan.');
    else if (!isBarcodeValue(d.barcode.trim())) e.barcode = t('The barcode can only use English letters, numbers and symbols — no Thai or emoji.');
  } else {
    const parsed = d.codeFile?.parsed;
    if (!parsed) e.codes = t('Upload a CSV file with the codes, one per row.');
    else if (parsed.invalidRows.length) {
      const [first] = parsed.invalidRows;
      e.codes =
        parsed.invalidRows.length === 1
          ? t('Row {row} (“{value}”) can’t be a barcode. Use English letters, numbers and symbols only, then upload the file again.', { row: first.row, value: first.value })
          : t('{count} rows can’t be barcodes, starting with row {row} (“{value}”). Use English letters, numbers and symbols only, then upload the file again.', {
              count: parsed.invalidRows.length,
              row: first.row,
              value: first.value,
            });
    } else if (!parsed.codes.length) e.codes = t('The file has no codes. Put one code per row in the first column.');
  }

  const qty = quantityOf(d);
  if (d.codeType === 'single') {
    if (!d.quantity.trim() || !Number.isInteger(qty) || qty < 1) e.quantity = t('Enter a whole number of 1 or more.');
    else if (qty < claimed) e.quantity = t('Can’t be lower than the {count} already claimed.', { count: fmt.number(claimed) });
  }
  if (!e.quantity && !e.codes && mode === 'activate' && qty <= claimed && claimed > 0)
    e.quantity = t('All {count} have been claimed. Raise the quantity so users can claim it.', { count: fmt.number(claimed) });

  const expiresAt = fromLocalParts(d.expiryDate, d.expiryTime);
  if (!expiresAt) e.expiry = t('Set the expiry date and time.');
  else if (phase && expiresAt < phase.startDate) e.expiry = t('This is before {phase} starts ({date}), so users would never see it. Pick a later date.', { phase: phase.name, date: fmt.date(phase.startDate) });
  else if (mode === 'activate' && expiresAt <= new Date().toISOString()) e.expiry = t('This time has passed, so users couldn’t claim it. Pick a later date.');

  return e;
}

interface CouponFormProps {
  /** Omit to create one. */
  coupon?: Coupon;
  /** New coupon only: brand to pre-select (e.g. "Create coupon" on a brand page). */
  defaultBrandId?: string;
  brands: Brand[];
  phases: Phase[];
  onBrandSaved: (brand: Brand) => void;
  /** Opens a brand's page, where brand details are edited. */
  onOpenBrand: (brandId: string) => void;
  onDirtyChange: (dirty: boolean) => void;
  onCancel: () => void;
  onSaved: (coupon: Coupon, created: boolean) => void;
  onToast: (message: string) => void;
}

// Create / edit coupon: details → conditions → code, quantity & expiry, with a live app preview.
// A coupon is created on its own and added to a phase afterwards, on the Phases page.
// Brand details (logo, notes, documents, default conditions) live on the brand's page, not here.
// BD sees it read-only.
export default function CouponForm({ coupon, defaultBrandId, brands, phases, onBrandSaved, onOpenBrand, onDirtyChange, onCancel, onSaved, onToast }: CouponFormProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const canEdit = useCan('coupon.write');
  const isEdit = Boolean(coupon);
  const claimed = coupon?.claimedCount ?? 0;
  const initial = useMemo(() => {
    const d = toDraft(coupon);
    if (coupon) return d;
    const preset = brands.find((b) => b.id === defaultBrandId);
    return {
      ...d,
      ...(preset && { brandId: preset.id, conditionsHtml: sanitizeHtml(preset.defaultConditionsHtml ?? '') }),
    };
    // Only the first render's partners matter: this is the form's starting point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon, defaultBrandId]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<SaveMode | null>(null);
  const [saving, setSaving] = useState<SaveMode | null>(null);
  const [saveError, setSaveError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [addingBrand, setAddingBrand] = useState<string | null>(null);
  /** Brand just added from this form, to point at its full page. */
  const [addedBrandId, setAddedBrandId] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState('');
  // Conditions the admin typed are never overwritten by a brand's defaults.
  const [conditionsTouched, setConditionsTouched] = useState(false);
  // The editor only reads its value on mount, so a new key loads replaced conditions.
  const [editorKey, setEditorKey] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const phase = coupon?.phaseId ? phases.find((p) => p.id === coupon.phaseId) : undefined;
  const brand = brands.find((s) => s.id === draft.brandId);
  const expiresAt = fromLocalParts(draft.expiryDate, draft.expiryTime);
  const quantity = quantityOf(draft);
  const ctx = { phase, claimed, t, fmt };

  const dirty = canEdit && JSON.stringify(draft) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  // Closing or reloading the tab.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // The app shows coupons as squares; warn when the image will be cropped.
  useEffect(() => {
    setImageWarning('');
    if (!draft.image) return;
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (Math.abs(ratio - 1) > 0.1) setImageWarning(t('This image is {w} × {h} px. The app shows coupons as a square, so the edges will be cropped.', { w: img.naturalWidth, h: img.naturalHeight }));
    };
    img.src = draft.image.url;
  }, [draft.image, t]);

  // New coupons start switched on (they go Active by themselves while their campaign runs), so they must be claimable.
  // A coupon that's turned off, or already expired / sold out, can be saved as it is.
  const strict: SaveMode = !coupon || (coupon.isActive && !activationBlock(coupon)) ? 'activate' : 'draft';
  const mode: SaveMode = submitted ?? 'draft';
  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (submitted) setErrors(validate(next, mode, ctx));
  };

  const scrollToFirstError = () => {
    const target = rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    const scroller = rootRef.current?.closest('main');
    if (!target || !scroller) return;
    const offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientHeight / 3;
    scroller.scrollBy({ top: offset, behavior: 'smooth' });
    target.focus({ preventScroll: true });
  };

  const save = async () => {
    const saveMode = strict;
    const next = validate(draft, saveMode, ctx);
    setErrors(next);
    setSubmitted(saveMode);
    setSaveError('');
    if (Object.keys(next).length) {
      requestAnimationFrame(scrollToFirstError);
      return;
    }
    setSaving(saveMode);
    try {
      const input: CouponInput = {
        id: coupon?.id,
        brandId: draft.brandId,
        title: draft.title.trim(),
        conditionsHtml: sanitizeHtml(draft.conditionsHtml),
        couponImageUrl: draft.image!.url,
        codeType: draft.codeType,
        ...(draft.codeType === 'single' ? { barcode: draft.barcode.trim() } : { uniqueCodes: draft.codeFile!.parsed.codes }),
        totalQuantity: quantity,
        expiresAt,
        // The switch is only changed on the Coupon list.
        isActive: coupon?.isActive ?? true,
      };
      const saved = await couponApi.coupons.save(input);
      onDirtyChange(false);
      onSaved(saved, !isEdit);
    } catch (e) {
      setSaveError(e instanceof CouponApiError ? e.message : t('Couldn’t save the coupon. Check your connection and try again.'));
      setSaving(null);
    }
  };

  /** New coupons start from the chosen brand's default conditions, unless the admin already wrote some. */
  const pickBrand = (brandId: string) => {
    const next = brands.find((b) => b.id === brandId);
    const defaults = next?.defaultConditionsHtml;
    if (!coupon && defaults && !conditionsTouched) {
      update({ brandId, conditionsHtml: sanitizeHtml(defaults) });
      setEditorKey((k) => k + 1);
    } else update({ brandId });
  };
  const useBrandDefaults = () => {
    update({ conditionsHtml: sanitizeHtml(brand?.defaultConditionsHtml ?? '') });
    setConditionsTouched(false);
    setEditorKey((k) => k + 1);
  };
  const conditionsAreDefaults = Boolean(brand?.defaultConditionsHtml) && draft.conditionsHtml === sanitizeHtml(brand?.defaultConditionsHtml ?? '');

  const searchBrands = async (query: string): Promise<SearchSelectItem[]> => {
    const q = query.trim().toLowerCase();
    return brands
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .map((b) => ({ id: b.id, title: b.name, thumbnail: b.logoUrl, meta: [t(BRAND_PARTNER_STATUS_LABELS[brandPartnerStatus(b)])] }));
  };
  const brandItem: SearchSelectItem | null = brand ? { id: brand.id, title: brand.name, thumbnail: brand.logoUrl, meta: [t(BRAND_PARTNER_STATUS_LABELS[brandPartnerStatus(brand)])] } : null;

  const leave = () => (dirty ? setConfirmDiscard(true) : onCancel());
  const errorCount = Object.keys(errors).length;
  const afterPhaseEnd = Boolean(phase && expiresAt && expiresAt > phase.endDate);
  const inPast = Boolean(expiresAt && expiresAt <= new Date().toISOString());

  return (
    <div ref={rootRef} className="flex-1 flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 pb-8 lg:pb-10">
        <div className={`${CONTENT_WIDTH} mx-auto`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-[28px] font-semibold leading-tight text-[#1A1A1A]">{!canEdit ? t('Coupon details') : isEdit ? t('Edit coupon') : t('Create coupon')}</h1>
              <p className="mt-1.5 text-sm text-[#6B7280]">{t('What users see on the Coupon Detail screen in the app, and the code they show at the store.')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={leave}
            className="mt-4 inline-flex items-center gap-1.5 h-8 -ml-1 px-1 text-sm text-[#6B7280] rounded-md hover:text-[#FF6115] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:arrow-left-linear" width={16} height={16} />
            {t('Back to {page}', { page: t('Coupon list') })}
          </button>

          {!canEdit && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#4B5563]">
              <Icon icon="solar:eye-linear" width={18} height={18} className="mt-0.5 flex-shrink-0 text-[#6B7280]" />
              {t('Only Admins can change coupons. Partner notes and documents are on the partner’s page in Partners.')}
            </p>
          )}

          {phase ? (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#4B5563]">
              <Icon icon="solar:calendar-linear" width={18} height={18} className="flex-shrink-0 text-[#6B7280]" />
              {t('In {phase}', { phase: phase.name })}
              <PhaseStatusBadge status={phase.status} />
              <span className="text-[#9CA3AF]">· {t('Runs {start} – {end}.', { start: fmt.date(phase.startDate), end: fmt.date(phase.endDate) })}</span>
              {coupon?.phaseQuantity !== undefined && <span className="text-[#9CA3AF]">· {t('{count} usable in this campaign', { count: fmt.number(coupon.phaseQuantity) })}</span>}
            </p>
          ) : (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#4B5563]">
              <Icon icon="solar:info-circle-linear" width={18} height={18} className="mt-0.5 flex-shrink-0 text-[#6B7280]" />
              {isEdit
                ? t('Not in a campaign yet, so it doesn’t show in the app. Add it to a campaign on the Campaigns page.')
                : t('Create the coupon first, then add it to a campaign on the Campaigns page. It shows in the app only while its campaign is running.')}
            </p>
          )}

          {coupon && !coupon.isActive && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#4B5563]">
              <Icon icon="solar:eye-closed-linear" width={18} height={18} className="mt-0.5 flex-shrink-0 text-[#6B7280]" />
              {t('Turned off, so it doesn’t show in the app even while its campaign runs. Turn it back on with its switch on the Coupon list.')}
            </p>
          )}

          {saveError && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
              <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
              {saveError}
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4 sm:gap-6 items-start">
            {/* Disabled fieldset makes every control read-only for BD in one place. */}
            <fieldset disabled={!canEdit} className="space-y-4 sm:space-y-6 min-w-0">
              {/* 1. Details */}
              <EventFormSection id="coupon-details" icon="solar:ticket-sale-linear" title={t('Coupon details')} description={t('The title, partner and image users see.')}>
                <div className="space-y-5">
                  <FormField label={t('Title')} required hint={t('Short and clear — it’s the headline of the coupon.')} error={errors.title}>
                    {(id) => (
                      <input
                        id={id}
                        value={draft.title}
                        maxLength={80}
                        onChange={(e) => update({ title: e.target.value })}
                        placeholder={t('e.g. {example}', { example: 'ลด 100.-' })}
                        aria-invalid={Boolean(errors.title) || undefined}
                        className={inputClass(Boolean(errors.title))}
                      />
                    )}
                  </FormField>

                  <FormField label={t('Partner')} required error={errors.brandId}>
                    {(id) => (
                      <div>
                        <SearchSelect
                          id={id}
                          value={brandItem}
                          onChange={(item) => pickBrand(item?.id ?? '')}
                          search={searchBrands}
                          placeholder={t('Search partner...')}
                          icon="solar:shop-linear"
                          invalid={Boolean(errors.brandId)}
                          action={canEdit ? { label: (q) => (q ? t('Add new partner “{name}”', { name: q }) : t('Add new partner')), onClick: setAddingBrand } : undefined}
                        />
                        {canEdit && !brand && (
                          <p className="mt-2 text-xs text-[#6B7280]">
                            {t('Can’t find it?')}{' '}
                            <button type="button" onClick={() => setAddingBrand('')} className="font-medium text-[#FF6115] hover:underline underline-offset-2">
                              {t('Add new partner')}
                            </button>
                          </p>
                        )}
                      </div>
                    )}
                  </FormField>

                  {brand && (
                    // Brand details are edited only on the brand's page.
                    <div className="-mt-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#4B5563]">
                      {addedBrandId === brand.id ? (
                        <p className="flex items-start gap-2 text-[#15803D]">
                          <Icon icon="solar:check-circle-linear" width={18} height={18} className="mt-0.5 flex-shrink-0" />
                          {t('“{name}” added. Fill in its partner period, contacts and default conditions on its partner page.', { name: brand.name })}
                        </p>
                      ) : brandPartnerStatus(brand) !== 'active' ? (
                        <p className="flex items-start gap-2 text-[#B45309]">
                          <Icon icon="solar:danger-triangle-linear" width={18} height={18} className="mt-0.5 flex-shrink-0" />
                          {brandPartnerStatus(brand) === 'contract_ended'
                            ? t('{name}’s partner contract has ended, so its logo won’t show in the app.', { name: brand.name })
                            : t('{name} isn’t an active partner, so its logo won’t show in the app.', { name: brand.name })}
                        </p>
                      ) : (
                        <p>{t('Logo, contacts and default conditions are managed on the partner’s page.')}</p>
                      )}
                      <button type="button" onClick={() => onOpenBrand(brand.id)} className="mt-1 inline-flex items-center gap-1 font-medium text-[#FF6115] hover:underline underline-offset-2">
                        {t('Open {name} in Partners', { name: brand.name })}
                        <Icon icon="solar:arrow-right-linear" width={14} height={14} />
                      </button>
                    </div>
                  )}

                  <FormField label={t('Coupon image')} required hint={t('Square, like the coupon card in the app. Recommended 1080 × 1080 px.')} error={errors.image} asGroup>
                    {() => (
                      <div aria-invalid={Boolean(errors.image) || undefined} tabIndex={errors.image ? -1 : undefined} className="focus:outline-none">
                        <BannerDropzone
                          title={t('Coupon image')}
                          aspect="square"
                          suggestedSize="1080 × 1080 px (1:1)"
                          maxMb={IMAGE_MAX_MB}
                          value={draft.image}
                          onChange={(image) => update({ image })}
                          onUpload={couponApi.coupons.uploadImage}
                          invalid={Boolean(errors.image)}
                        />
                        {imageWarning && <p className="mt-2 text-xs text-[#B45309]">{imageWarning}</p>}
                      </div>
                    )}
                  </FormField>
                </div>
              </EventFormSection>

              {/* 2. Conditions */}
              <EventFormSection id="coupon-conditions" icon="solar:document-text-linear" title={t('Conditions')} description={t('Terms of use, shown under the coupon in the app.')}>
                {!coupon && brand?.defaultConditionsHtml && canEdit && (
                  <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B7280]">
                    {conditionsAreDefaults ? (
                      t('Filled in from {name}’s default conditions. You can change them for this coupon.', { name: brand.name })
                    ) : (
                      <>
                        {t('{name} has default conditions.', { name: brand.name })}
                        <button type="button" onClick={useBrandDefaults} className="font-medium text-[#FF6115] hover:underline underline-offset-2">
                          {t('Use them instead')}
                        </button>
                      </>
                    )}
                  </p>
                )}
                <RichTextEditor
                  key={editorKey}
                  variant="basic"
                  readOnly={!canEdit}
                  defaultValue={draft.conditionsHtml}
                  onChange={(conditionsHtml) => {
                    setConditionsTouched(true);
                    update({ conditionsHtml });
                  }}
                  placeholder={t('e.g. Valid at all branches. One per account. Can’t be combined with other promotions.')}
                  ariaLabel={t('Conditions')}
                />
              </EventFormSection>

              {/* 3. Code, quantity and expiry */}
              <EventFormSection
                id="coupon-code"
                icon="solar:code-scan-linear"
                title={t('Code')}
                description={t('The barcode users show at the store, how many users can claim it, and until when it can be used.')}
              >
                <CouponCodeField
                  codeType={draft.codeType}
                  barcode={draft.barcode}
                  codeFile={draft.codeFile}
                  onChange={(patch) => update(patch)}
                  errors={{ barcode: errors.barcode, codes: errors.codes }}
                  locked={claimed > 0}
                />
                <div id="coupon-quantity" className="mt-6 pt-6 border-t border-[#F0F0F0] grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label={t('Total quantity')}
                    required
                    hint={
                      draft.codeType === 'unique'
                        ? t('Set by the number of codes above.')
                        : claimed > 0
                          ? t('{count} already claimed.', { count: fmt.number(claimed) })
                          : t('How many users can claim this coupon.')
                    }
                    error={errors.quantity}
                  >
                    {(id) =>
                      draft.codeType === 'unique' ? (
                        <div className="relative">
                          <input id={id} value={fmt.number(quantity)} readOnly aria-invalid={Boolean(errors.quantity) || undefined} className={`${inputClass(Boolean(errors.quantity))} bg-[#F9FAFB] text-[#6B7280] pr-10`} />
                          <Icon icon="solar:lock-keyhole-minimalistic-linear" width={18} height={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" aria-hidden="true" />
                        </div>
                      ) : (
                        <input
                          id={id}
                          type="number"
                          inputMode="numeric"
                          min={Math.max(1, claimed)}
                          step={1}
                          value={draft.quantity}
                          onChange={(e) => update({ quantity: e.target.value })}
                          placeholder={t('e.g. {example}', { example: '500' })}
                          aria-invalid={Boolean(errors.quantity) || undefined}
                          className={inputClass(Boolean(errors.quantity))}
                        />
                      )
                    }
                  </FormField>

                  <FormField label={t('Expires')} required hint={t('Users can’t redeem it after this date and time.')} error={errors.expiry} asGroup>
                    {() => (
                      <div>
                        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
                          <PickerInput type="date" size="md" value={draft.expiryDate} onChange={(expiryDate) => update({ expiryDate })} placeholder={t('Date')} invalid={Boolean(errors.expiry)} />
                          <PickerInput type="time" size="md" value={draft.expiryTime} onChange={(expiryTime) => update({ expiryTime })} placeholder={t('Time')} invalid={Boolean(errors.expiry)} />
                        </div>
                        {!errors.expiry && afterPhaseEnd && phase && (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-[#B45309]">
                            <Icon icon="solar:danger-triangle-linear" width={14} height={14} className="mt-px flex-shrink-0" />
                            {t('This is after {phase} ends ({date}). Users can keep redeeming it after the campaign is over.', { phase: phase.name, date: fmt.dateTime(phase.endDate) })}
                          </p>
                        )}
                        {!errors.expiry && inPast && (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-[#B45309]">
                            <Icon icon="solar:danger-triangle-linear" width={14} height={14} className="mt-px flex-shrink-0" />
                            {t('This time has passed, so the coupon will show as Expired.')}
                          </p>
                        )}
                      </div>
                    )}
                  </FormField>
                </div>
              </EventFormSection>
            </fieldset>

            {/* 5. App preview */}
            <div className="lg:sticky lg:top-6 min-w-0">
              <EventFormSection id="coupon-preview" icon="solar:smartphone-2-linear" title={t('App preview')} description={t('The Coupon Detail screen, as users see it.')}>
                <CouponAppPreview
                  imageUrl={draft.image?.url}
                  title={draft.title.trim()}
                  brandName={brand?.name}
                  brandLogoUrl={brand?.logoUrl}
                  conditionsHtml={draft.conditionsHtml}
                  expiresAt={expiresAt}
                  remaining={Math.max(0, (Number.isFinite(quantity) ? quantity : 0) - claimed)}
                />
              </EventFormSection>
            </div>

            {/* 6. Data Viewer — everyone can see who opened the coupon in the app. */}
            {coupon && (
              <div className="lg:col-start-1 min-w-0">
                <CouponViewersPanel coupon={coupon} />
              </div>
            )}
          </div>
        </div>
      </div>

      {canEdit && (
        <StickyActionBar
          maxWidth={CONTENT_WIDTH}
          note={
            errorCount > 0 ? (
              <button type="button" onClick={scrollToFirstError} className="inline-flex items-center gap-1.5 text-[#DC2626] font-medium hover:underline underline-offset-2">
                <Icon icon="solar:danger-circle-linear" width={16} height={16} className="flex-shrink-0" />
                {errorCount === 1 ? t('1 field needs attention') : t('{count} fields need attention', { count: errorCount })}
              </button>
            ) : (
              <span>
                {t('Required fields are marked with an asterisk')} (<span className="text-[#DC2626]">*</span>).
              </span>
            )
          }
          tertiary={{ label: t('Cancel'), onClick: leave, disabled: Boolean(saving) }}
          primary={{
            label: saving ? t('Saving…') : isEdit ? t('Save changes') : t('Create coupon'),
            onClick: save,
            disabled: Boolean(saving),
          }}
        />
      )}

      {addingBrand !== null && (
        <AddBrandModal
          brands={brands}
          initialName={addingBrand}
          onClose={() => setAddingBrand(null)}
          onCreated={(created) => {
            onBrandSaved(created);
            update({ brandId: created.id });
            setAddedBrandId(created.id);
            setAddingBrand(null);
            onToast(t('“{name}” added.', { name: created.name }));
          }}
        />
      )}

      {confirmDiscard && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved changes to this coupon will be lost.')}
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
