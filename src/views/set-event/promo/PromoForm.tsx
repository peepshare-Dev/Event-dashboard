import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import EventFormSection from '../../../components/set-event/form/EventFormSection';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import SelectField from '../../../components/set-event/form/SelectField';
import SegmentedControl from '../../../components/set-event/form/SegmentedControl';
import ChoiceCards from '../../../components/set-event/form/ChoiceCards';
import DateTimeRange from '../../../components/set-event/form/DateTimeRange';
import SearchSelect, { type SearchSelectItem } from '../../../components/set-event/form/SearchSelect';
import StickyActionBar from '../../../components/set-event/form/StickyActionBar';
import BannerDropzone from '../../../components/set-event/BannerDropzone';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import PromoPreview from './PromoPreview';
import type { Placement } from './placements';
import { couponApi } from '../../../data/mock/promoApi';
import {
  APP_PAGES,
  CLICK_ACTIONS,
  CONTENT_TYPES,
  SHOW_FREQUENCIES,
  contentTypeLabel,
  displayStatus,
  formatDay,
  nowLocal,
  type BannerImageFile,
  type BannerStatus,
  type ClickAction,
  type ContentType,
  type DisplayMode,
  type PromoItem,
  type ShowFrequency,
  type Translate,
} from '../../../data/appBanners';
import type { SetEvent } from '../../../data/setEvents';
import { useT } from '@/i18n';

const CONTENT_WIDTH = 'max-w-[1200px]';

interface Draft {
  name: string;
  image: BannerImageFile | null;
  status: BannerStatus;
  displayMode: DisplayMode;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  showFrequency: ShowFrequency;
  clickAction: ClickAction;
  url: string;
  appPage: string;
  contentType: ContentType | '';
  /** ID of the event / post / community to open. */
  contentId: string;
  coupon: SearchSelectItem | null;
}

function toDraft(b?: PromoItem): Draft {
  const linked = (prefix: string): SearchSelectItem | null =>
    b?.destinationId ? { id: b.destinationId, title: b.destinationLabel || b.destinationId, meta: [`${prefix} ID: ${b.destinationId}`] } : null;
  return {
    name: b?.name ?? '',
    image: b?.image ?? null,
    status: b?.status ?? 'active',
    displayMode: b?.displayMode ?? 'always',
    startDate: b?.startAt.slice(0, 10) ?? '',
    startTime: b?.startAt.slice(11, 16) ?? '',
    endDate: b?.endAt.slice(0, 10) ?? '',
    endTime: b?.endAt.slice(11, 16) ?? '',
    showFrequency: b?.showFrequency ?? 'once_per_day',
    clickAction: b?.clickAction ?? 'none',
    url: b?.clickAction === 'url' ? b.destinationUrl : '',
    appPage: b?.clickAction === 'app_page' ? b.destinationType : '',
    contentType: b?.clickAction === 'content' ? (b.destinationType as ContentType) : '',
    contentId: b?.clickAction === 'content' ? b.destinationId : '',
    coupon: b?.clickAction === 'coupon' ? linked('Coupon') : null,
  };
}

/** Keeps the saved name while the ID is unchanged; a new ID is shown as "ID: …" until the backend resolves its name. */
const contentLabel = (id: string, base: PromoItem | undefined) =>
  base?.clickAction === 'content' && base.destinationId === id && base.destinationLabel ? base.destinationLabel : `ID: ${id}`;

/** Only the destination fields for the chosen click action are kept. */
function toItem(d: Draft, base: PromoItem | undefined, withFrequency: boolean): PromoItem {
  const schedule = d.displayMode === 'schedule';
  const destination = {
    destinationType: d.clickAction === 'app_page' ? d.appPage : d.clickAction === 'content' ? d.contentType : d.clickAction === 'coupon' ? 'coupon' : '',
    destinationId: d.clickAction === 'content' ? d.contentId.trim() : d.clickAction === 'coupon' ? (d.coupon?.id ?? '') : '',
    destinationLabel: d.clickAction === 'content' ? contentLabel(d.contentId.trim(), base) : d.clickAction === 'coupon' ? (d.coupon?.title ?? '') : '',
    destinationUrl: d.clickAction === 'url' ? d.url.trim() : '',
  };
  return {
    id: base?.id ?? '',
    name: d.name.trim(),
    image: d.image,
    status: d.status,
    displayMode: d.displayMode,
    startAt: schedule && d.startDate && d.startTime ? `${d.startDate}T${d.startTime}` : '',
    endAt: schedule && d.endDate && d.endTime ? `${d.endDate}T${d.endTime}` : '',
    clickAction: d.clickAction,
    ...destination,
    priority: base?.priority ?? 0,
    createdAt: base?.createdAt ?? nowLocal(),
    updatedAt: nowLocal(),
    ...(withFrequency && { showFrequency: d.showFrequency }),
  };
}

type Errors = Partial<Record<'name' | 'image' | 'start' | 'end' | 'url' | 'appPage' | 'contentType' | 'content' | 'coupon', string>>;

/** `noun` is already translated; `t` turns each message into the current language. */
function validate(d: Draft, noun: string, t: Translate): Errors {
  const e: Errors = {};
  if (!d.name.trim()) e.name = t('Enter a {noun} name.', { noun: noun.toLowerCase() });
  if (!d.image) e.image = t('Upload a {noun} image.', { noun: noun.toLowerCase() });
  if (d.displayMode === 'schedule') {
    if (!d.startDate || !d.startTime) e.start = t('Set the start date and time.');
    if (!d.endDate || !d.endTime) e.end = t('Set the end date and time.');
    if (!e.start && !e.end && `${d.endDate}T${d.endTime}` < `${d.startDate}T${d.startTime}`) e.end = t('The end can’t be earlier than the start.');
  }
  if (d.clickAction === 'url') {
    if (!d.url.trim()) e.url = t('Enter the URL to open.');
    else {
      try {
        const u = new URL(d.url.trim());
        if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
      } catch {
        e.url = t('Enter a valid link, starting with https://');
      }
    }
  }
  if (d.clickAction === 'app_page' && !d.appPage) e.appPage = t('Choose the page to open.');
  if (d.clickAction === 'content') {
    if (!d.contentType) e.contentType = t('Choose a content type.');
    else if (!d.contentId.trim()) e.content = t('Enter the content ID.');
  }
  if (d.clickAction === 'coupon' && !d.coupon) e.coupon = t('Select the coupon to open.');
  return Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as Errors;
}

interface PromoFormProps {
  placement: Placement;
  /** Omit to create one. */
  item?: PromoItem;
  events: SetEvent[];
  /** All items, to place a new one in the preview's priority. */
  allItems: PromoItem[];
  onDirtyChange: (dirty: boolean) => void;
  onCancel: () => void;
  onSaved: (item: PromoItem, created: boolean) => void;
}

// One form for Create and Edit, for Banner and Cover Page:
// WHAT → WHEN → [FREQUENCY] → ACTION, with a live preview.
export default function PromoForm({ placement, item: banner, allItems, onDirtyChange, onCancel, onSaved }: PromoFormProps) {
  const t = useT();
  const noun = t(placement.noun);
  const lower = noun.toLowerCase();
  const isEdit = Boolean(banner);
  const initial = useMemo(() => toDraft(banner), [banner]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (submitted) setErrors(validate(next, noun, t));
  };

  const preview = toItem(draft, banner, placement.frequency);
  const shownAs = displayStatus(preview);

  const scrollToFirstError = () => {
    const target = rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    const scroller = rootRef.current?.closest('main');
    if (!target || !scroller) return;
    const offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientHeight / 3;
    scroller.scrollBy({ top: offset, behavior: 'smooth' });
    target.focus({ preventScroll: true });
  };

  const save = async () => {
    const next = validate(draft, noun, t);
    setErrors(next);
    setSubmitted(true);
    setSaveError('');
    if (Object.keys(next).length) {
      requestAnimationFrame(scrollToFirstError);
      return;
    }
    setSaving(true);
    try {
      const saved = await placement.api.save(preview);
      onDirtyChange(false);
      onSaved(saved, !isEdit);
    } catch {
      setSaveError(t('Couldn’t save the {noun}. Check your connection and try again.', { noun: lower }));
      setSaving(false);
    }
  };

  const errorCount = Object.keys(errors).length;
  const position = isEdit ? banner!.priority : allItems.length + 1;

  return (
    <div ref={rootRef} className="flex-1 flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 pb-8 lg:pb-10">
        <div className={`${CONTENT_WIDTH} mx-auto`}>
          <h1 className="text-2xl sm:text-[28px] font-semibold leading-tight text-[#1A1A1A]">{isEdit ? t('Edit {noun}', { noun }) : t('Create {noun}', { noun })}</h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">{t(placement.formIntro)}</p>
          <button
            type="button"
            onClick={() => (dirty ? setConfirmDiscard(true) : onCancel())}
            className="mt-4 inline-flex items-center gap-1.5 h-8 -ml-1 px-1 text-sm text-[#6B7280] rounded-md hover:text-[#FF6115] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:arrow-left-linear" width={16} height={16} />
            {t('Back to {page}', { page: t(placement.menuTitle) })}
          </button>

          {saveError && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
              <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
              {saveError}
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 sm:gap-6 items-start">
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* 1. WHAT */}
              <EventFormSection id={`${placement.key}-information`} icon={placement.icon} title={t('{noun} Information', { noun })} description={t('What the {noun} shows.', { noun: lower })}>
                <div className="space-y-5">
                  <FormField label={t('{noun} Name', { noun })} required hint={t('Use a clear name to help administrators identify this {noun}.', { noun: lower })} error={errors.name}>
                    {(id) => (
                      <input
                        id={id}
                        value={draft.name}
                        onChange={(e) => update({ name: e.target.value })}
                        placeholder={t('e.g. {example}', { example: placement.key === 'banner' ? 'Zumba Fitness 2026' : 'MonoMax Watch Party 2026' })}
                        maxLength={80}
                        aria-invalid={Boolean(errors.name) || undefined}
                        className={inputClass(Boolean(errors.name))}
                      />
                    )}
                  </FormField>

                  <FormField label={t('{noun} Image', { noun })} required hint={t('Recommended size {size}. JPEG or PNG.', { size: placement.imageSize })} error={errors.image} asGroup>
                    {() => (
                      <div aria-invalid={Boolean(errors.image) || undefined} tabIndex={errors.image ? -1 : undefined} className="focus:outline-none">
                        <BannerDropzone
                          title={t('{noun} image', { noun })}
                          suggestedSize={placement.imageSize}
                          aspect={placement.shape === 'banner' ? 'banner' : 'portrait'}
                          value={draft.image}
                          onChange={(image) => update({ image })}
                          onUpload={placement.api.uploadImage}
                          invalid={Boolean(errors.image)}
                        />
                      </div>
                    )}
                  </FormField>

                  <FormField label={t('Status')} hint={statusHint(draft.status, shownAs, preview.startAt, t)} asGroup>
                    {() => (
                      <SegmentedControl
                        label={t('Status')}
                        value={draft.status}
                        options={[
                          { value: 'active', label: t('Active') },
                          { value: 'inactive', label: t('Inactive') },
                          { value: 'draft', label: t('Draft') },
                        ]}
                        onChange={(status) => update({ status })}
                      />
                    )}
                  </FormField>
                </div>
              </EventFormSection>

              {/* 2. WHEN */}
              <EventFormSection id={`${placement.key}-display`} icon="solar:calendar-linear" title={t('Display Settings')} description={t('When the {noun} appears in the app.', { noun: lower })}>
                <div className="space-y-5">
                  <FormField label={t('Display Period')} asGroup>
                    {() => (
                      <SegmentedControl
                        label={t('Display Period')}
                        value={draft.displayMode}
                        options={[
                          { value: 'always', label: t('Always') },
                          { value: 'schedule', label: t('[verb] Schedule') },
                        ]}
                        onChange={(displayMode) => update({ displayMode })}
                      />
                    )}
                  </FormField>
                  {draft.displayMode === 'always' ? (
                    <p className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Icon icon="solar:infinity-linear" width={18} height={18} className="flex-shrink-0" />
                      {t('Shown whenever the {noun} is active, with no end date.', { noun: lower })}
                    </p>
                  ) : (
                    <FormField label={t('Start → End')} required hint={t('Both dates and times are required.')} error={errors.start ?? errors.end} asGroup>
                      {() => (
                        <DateTimeRange
                          start={{ date: draft.startDate, time: draft.startTime }}
                          end={{ date: draft.endDate, time: draft.endTime }}
                          onStartChange={(p) => update({ startDate: p.date ?? draft.startDate, startTime: p.time ?? draft.startTime })}
                          onEndChange={(p) => update({ endDate: p.date ?? draft.endDate, endTime: p.time ?? draft.endTime })}
                          startInvalid={Boolean(errors.start)}
                          endInvalid={Boolean(errors.end)}
                        />
                      )}
                    </FormField>
                  )}
                </div>
              </EventFormSection>

              {/* 3. FREQUENCY — Cover Page only */}
              {placement.frequency && (
                <EventFormSection id={`${placement.key}-frequency`} icon="solar:restart-linear" title={t('Show Frequency')} description={t('How often the same user sees this popup.')}>
                  <ChoiceCards
                    label={t('Show Frequency')}
                    value={draft.showFrequency}
                    options={SHOW_FREQUENCIES.map((f) => ({ ...f, label: t(f.label), description: t(f.description) }))}
                    onChange={(showFrequency) => update({ showFrequency })}
                    columns="sm:grid-cols-3"
                  />
                </EventFormSection>
              )}

              {/* 4. WHERE / ACTION */}
              <EventFormSection id={`${placement.key}-click`} icon="solar:cursor-linear" title={t('Click Action')} description={t('What happens when users tap the {noun}.', { noun: lower })}>
                <div className="space-y-5">
                  <ChoiceCards label={t('Click Action')} value={draft.clickAction} options={CLICK_ACTIONS.map((c) => ({ ...c, label: t(c.label), description: t(c.description) }))} onChange={(clickAction) => update({ clickAction })} columns="sm:grid-cols-2 xl:grid-cols-3" />

                  {draft.clickAction !== 'none' && (
                    <div className="pt-5 border-t border-[#F0F0F0] space-y-5">
                      {draft.clickAction === 'url' && (
                        <FormField label={t('URL')} required hint={t('Users will be redirected to this URL when they tap the banner.')} error={errors.url}>
                          {(id) => (
                            <input
                              id={id}
                              type="url"
                              inputMode="url"
                              value={draft.url}
                              onChange={(e) => update({ url: e.target.value })}
                              placeholder="https://example.com/event"
                              aria-invalid={Boolean(errors.url) || undefined}
                              className={inputClass(Boolean(errors.url))}
                            />
                          )}
                        </FormField>
                      )}

                      {draft.clickAction === 'app_page' && (
                        <FormField label={t('Destination')} required hint={t('The page inside Peep Share that opens.')} error={errors.appPage}>
                          {(id) => (
                            <SelectField
                              id={id}
                              value={draft.appPage}
                              options={APP_PAGES.map((p) => ({ ...p, label: t(p.label) }))}
                              onChange={(appPage) => update({ appPage })}
                              placeholder={t('Select app page')}
                              icon="solar:smartphone-linear"
                              invalid={Boolean(errors.appPage)}
                            />
                          )}
                        </FormField>
                      )}

                      {draft.clickAction === 'content' && (
                        <>
                          <FormField label={t('Content Type')} required error={errors.contentType}>
                            {(id) => (
                              <SelectField
                                id={id}
                                value={draft.contentType}
                                options={CONTENT_TYPES.map((c) => ({ ...c, label: t(c.label) }))}
                                // A new type needs a new item.
                                onChange={(contentType) => update({ contentType })}
                                placeholder={t('Select content type')}
                                icon="solar:document-text-linear"
                                invalid={Boolean(errors.contentType)}
                              />
                            )}
                          </FormField>
                          {draft.contentType && (
                            <FormField
                              label={t('ID Content')}
                              required
                              hint={t('The ID of the {type} to open.', { type: t(contentTypeLabel(draft.contentType)).toLowerCase() })}
                              error={errors.content}
                            >
                              {(id) => (
                                <div className="relative">
                                  <Icon
                                    icon={CONTENT_TYPES.find((c) => c.value === draft.contentType)!.icon}
                                    width={18}
                                    height={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                                  />
                                  <input
                                    id={id}
                                    value={draft.contentId}
                                    onChange={(e) => update({ contentId: e.target.value })}
                                    placeholder={t('Enter {type} ID', { type: t(contentTypeLabel(draft.contentType)).toLowerCase() })}
                                    autoComplete="off"
                                    spellCheck={false}
                                    aria-invalid={Boolean(errors.content) || undefined}
                                    className={`${inputClass(Boolean(errors.content))} pl-10`}
                                  />
                                </div>
                              )}
                            </FormField>
                          )}
                        </>
                      )}

                      {draft.clickAction === 'coupon' && (
                        <FormField label={t('Select Coupon')} required error={errors.coupon}>
                          {(id) => (
                            <SearchSelect
                              id={id}
                              value={draft.coupon}
                              onChange={(coupon) => update({ coupon })}
                              search={couponApi.search}
                              placeholder={t('Search coupon...')}
                              icon="solar:sale-linear"
                              invalid={Boolean(errors.coupon)}
                            />
                          )}
                        </FormField>
                      )}
                    </div>
                  )}
                </div>
              </EventFormSection>
            </div>

            {/* Preview */}
            <div className="lg:sticky lg:top-6 min-w-0">
              <EventFormSection id={`${placement.key}-preview`} icon="solar:eye-linear" title={t('Preview')} description={t(placement.previewDescription)}>
                <PromoPreview placement={placement} item={preview} position={position} shownAs={shownAs} />
              </EventFormSection>
            </div>
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
            <span>
              {t('Required fields are marked with an asterisk')} (<span className="text-[#DC2626]">*</span>).
            </span>
          )
        }
        tertiary={{ label: t('Cancel'), onClick: () => (dirty ? setConfirmDiscard(true) : onCancel()), disabled: saving }}
        primary={{ label: saving ? t('Saving…') : isEdit ? t('Save Changes') : t('Save {noun}', { noun }), onClick: save, disabled: saving }}
      />

      {confirmDiscard && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved changes to this {noun} will be lost.', { noun: lower })}
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

function statusHint(status: BannerStatus, shownAs: string, startAt: string, t: Translate) {
  if (status === 'draft') return t('Drafts are saved but never shown in the app.');
  if (status === 'inactive') return t('Hidden from the app until you activate it.');
  if (shownAs === 'Scheduled') return t('Shows as Scheduled until {date}.', { date: `${formatDay(startAt, t)} ${startAt.slice(11, 16)}` });
  if (shownAs === 'Expired') return t('The display period has already ended, so it will show as Expired.');
  return t('Shown in the app now.');
}
