import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { STATUS_DOT } from '../../components/ui/StatusBadge';
import PickerInput from '../../components/ui/PickerInput';
import Toggle from '../../components/ui/Toggle';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import RichTextEditor from '../../components/set-event/RichTextEditor';
import BannerDropzone from '../../components/set-event/BannerDropzone';
import OptionPickerModal from '../../components/set-event/OptionPickerModal';
import EventPreviewModal, { openEventPreviewTab } from '../../components/set-event/EventPreviewModal';
import StatusVisibilityPanel from '../../components/set-event/StatusVisibilityPanel';
import { mockCollections } from '../Collections';
import {
  CURRENT_AUTHOR,
  EVENT_CATEGORIES,
  REGISTRATION_FORM_TEMPLATES,
  type EventCategory,
  type SetEvent,
  type SetEventStatus,
} from '../../data/setEvents';

interface EventFormPageProps {
  /** Omit to create a new event. */
  event?: SetEvent;
  nextId: number;
  onBack: () => void;
  onSave: (event: SetEvent, action: SaveAction) => void;
  onMoveToTrash?: (event: SetEvent) => void;
  /** Just submitted for review: scroll to the top and point at Publish. */
  highlightPublish?: boolean;
  /** Lets the parent guard navigation away from unsaved changes. */
  onDirtyChange?: (dirty: boolean) => void;
}

/** draft → Draft, review → Pending, publish → Published/Private/Scheduled, save → keep the chosen status. */
export type SaveAction = 'draft' | 'review' | 'publish' | 'save';

interface FormState {
  name: string;
  category: EventCategory | '';
  status: SetEventStatus;
  description: string;
  banner: { url: string; name: string } | null;
  latitude: string;
  longitude: string;
  eventDate: string;
  eventStart: string;
  eventEnd: string;
  regDate: string;
  regStart: string;
  regEnd: string;
  surveyDate: string;
  surveyTime: string;
  qrDate: string;
  qrTime: string;
  allowJoin: boolean;
  registrationForms: string[];
  collectionId: number | null;
  scheduledDate: string;
  scheduledTime: string;
  passwordEnabled: boolean;
  password: string;
}

// --- Mapping between the stored event and the form's split date/time fields ---

const datePart = (value = '') => value.slice(0, 10);
const timePart = (value = '') => value.slice(11, 16);
const joinDateTime = (date: string, time: string) => (date && time ? `${date}T${time}` : '');

function toForm(event?: SetEvent): FormState {
  const d = event?.details;
  return {
    name: event?.name ?? '',
    category: event?.category ?? '',
    status: event?.status ?? 'Draft',
    description: d?.description ?? '',
    banner: d?.banner ?? null,
    latitude: d?.latitude ?? '',
    longitude: d?.longitude ?? '',
    eventDate: datePart(event?.startTime),
    eventStart: timePart(event?.startTime),
    eventEnd: timePart(event?.endTime),
    regDate: datePart(d?.registrationStart),
    regStart: timePart(d?.registrationStart),
    regEnd: timePart(d?.registrationEnd),
    surveyDate: datePart(d?.surveySendTime),
    surveyTime: timePart(d?.surveySendTime),
    qrDate: datePart(d?.qrExpiresAt),
    qrTime: timePart(d?.qrExpiresAt),
    allowJoin: d?.allowJoin ?? true,
    registrationForms: d?.registrationForms ?? [],
    collectionId: d?.collectionId ?? null,
    scheduledDate: datePart(d?.scheduledAt),
    scheduledTime: timePart(d?.scheduledAt),
    passwordEnabled: Boolean(d?.password),
    password: d?.password ?? '',
  };
}

function fromForm(form: FormState, base: SetEvent | undefined, id: number, status: SetEventStatus): SetEvent {
  return {
    id,
    name: form.name.trim(),
    author: base?.author ?? CURRENT_AUTHOR,
    category: form.category,
    registrants: base?.registrants ?? 0,
    status,
    ticketType: base?.ticketType ?? 'Free',
    startTime: joinDateTime(form.eventDate, form.eventStart),
    endTime: joinDateTime(form.eventDate, form.eventEnd),
    details: {
      // Keep fields this form doesn't edit (e.g. QR links).
      ...base?.details,
      description: form.description,
      banner: form.banner,
      latitude: form.latitude.trim(),
      longitude: form.longitude.trim(),
      registrationStart: joinDateTime(form.regDate, form.regStart),
      registrationEnd: joinDateTime(form.regDate, form.regEnd),
      surveySendTime: joinDateTime(form.surveyDate, form.surveyTime),
      qrExpiresAt: joinDateTime(form.qrDate, form.qrTime),
      allowJoin: form.allowJoin,
      registrationForms: form.registrationForms,
      collectionId: form.collectionId,
      scheduledAt: status === 'Scheduled' ? joinDateTime(form.scheduledDate, form.scheduledTime) : '',
      password: form.passwordEnabled ? form.password.trim() : '',
    },
  };
}

type Errors = Partial<
  Record<'name' | 'category' | 'eventDate' | 'eventTime' | 'regTime' | 'latitude' | 'longitude' | 'schedule' | 'password', string>
>;

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function validateCoordinate(value: string, limit: number, label: string): string | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || Math.abs(n) > limit) return `${label} must be a number between -${limit} and ${limit}.`;
  return undefined;
}

// Drafts only need well-formed values; review, publishing and non-draft saves also need the essentials.
function validate(form: FormState, forReview: boolean): Errors {
  const errors: Errors = {
    latitude: validateCoordinate(form.latitude, 90, 'Latitude'),
    longitude: validateCoordinate(form.longitude, 180, 'Longitude'),
  };
  if (form.eventStart && form.eventEnd && form.eventEnd < form.eventStart) errors.eventTime = 'End time must be after the start time.';
  if (form.regStart && form.regEnd && form.regEnd < form.regStart) errors.regTime = 'End time must be after the start time.';
  if (form.status === 'Scheduled') {
    const at = joinDateTime(form.scheduledDate, form.scheduledTime);
    if (!at) errors.schedule = 'Choose the date and time to publish.';
    else if (at <= nowLocal()) errors.schedule = 'Choose a date and time in the future.';
  }
  if (form.passwordEnabled && form.password.trim().length < 4) errors.password = 'Use at least 4 characters.';
  if (forReview) {
    if (!form.name.trim()) errors.name = 'Enter an event name.';
    if (!form.category) errors.category = 'Select a category.';
    if (!form.eventDate) errors.eventDate = 'Select the event date.';
    else if (!form.eventStart || !form.eventEnd) errors.eventTime ??= 'Set both the start and end time.';
  }
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as Errors;
}

const inputClass = (invalid?: boolean) =>
  `w-full h-12 px-3 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] ${
    invalid ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
  }`;

export default function EventFormPage({ event, nextId, onBack, onSave, onMoveToTrash, highlightPublish, onDirtyChange }: EventFormPageProps) {
  const isEdit = Boolean(event);
  const initial = useMemo(() => toForm(event), [event]);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [modal, setModal] = useState<'preview' | 'collection' | 'form' | 'discard' | null>(null);
  const [menu, setMenu] = useState<'status' | 'category' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const publishRef = useRef<HTMLButtonElement>(null);
  const [publishHint, setPublishHint] = useState(Boolean(highlightPublish));

  // After a failed save, re-check with the same rules as the user edits.
  const [checkedForReview, setCheckedForReview] = useState<boolean | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const patch = (changes: Partial<FormState>) => {
    const next = { ...form, ...changes };
    setForm(next);
    if (checkedForReview !== null) setErrors(validate(next, checkedForReview));
  };
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => patch({ [key]: value } as Partial<FormState>);

  useEffect(() => {
    rootRef.current?.closest('main')?.scrollTo({ top: 0, behavior: highlightPublish ? 'smooth' : 'auto' });
    if (highlightPublish) publishRef.current?.focus({ preventScroll: true });
    const onChange = () => setIsFullscreen(document.fullscreenElement === cardRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (!publishHint) return;
    const timer = setTimeout(() => setPublishHint(false), 3000);
    return () => clearTimeout(timer);
  }, [publishHint]);

  const previewData = () => ({
    name: form.name.trim(),
    category: form.category,
    status: form.status,
    bannerUrl: form.banner?.url,
    descriptionHtml: form.description,
    startTime: joinDateTime(form.eventDate, form.eventStart),
    endTime: joinDateTime(form.eventDate, form.eventEnd),
  });
  const openPreviewTab = () => openEventPreviewTab(previewData());

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else cardRef.current?.requestFullscreen?.();
  };

  const leave = () => (isDirty ? setModal('discard') : onBack());

  const resultingStatus = (action: SaveAction): SetEventStatus => {
    if (action === 'draft') return 'Draft';
    if (action === 'review') return 'Pending';
    if (action === 'publish') return form.status === 'Scheduled' || form.status === 'Private' ? form.status : 'Published';
    return form.status;
  };

  const submit = (action: SaveAction) => {
    const status = resultingStatus(action);
    const essentials = action !== 'draft' && status !== 'Draft';
    const nextErrors = validate({ ...form, status }, essentials);
    setErrors(nextErrors);
    setCheckedForReview(essentials);
    if (Object.keys(nextErrors).length) {
      // Schedule and password live in the Status & visibility panel — open it to show the problem.
      if (nextErrors.schedule || nextErrors.password) setMenu('status');
      else cardRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (document.fullscreenElement) document.exitFullscreen();
    onSave(fromForm(form, event, event?.id ?? nextId, status), action);
  };

  const savedStatus = event?.status;
  // Publishing opens up once the event has been through review (or already is live in some form).
  const canPublish = savedStatus === 'Pending' || savedStatus === 'Private' || savedStatus === 'Scheduled';
  // Already-published and trashed events are just saved, so they don't show Publish.
  const showPublish = savedStatus !== 'Published' && savedStatus !== 'Trash';
  const publishHintId = useId();
  // New events and drafts go through review; everything else is simply saved.
  const reviewFlow = !isEdit || savedStatus === 'Draft';
  const selectedCollection = mockCollections.find((c) => c.id === form.collectionId);

  return (
    <div ref={rootRef} className="p-4 sm:p-6 lg:p-8">
      <div
        ref={cardRef}
        className={`bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${isFullscreen ? 'overflow-y-auto' : 'rounded-2xl'}`}
      >
        {/* Title bar */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
          <nav aria-label="Breadcrumb" className="text-xs text-[#6B7280]">
            <button onClick={leave} className="underline underline-offset-2 hover:text-[#FF6115]">
              Event List
            </button>
            <span className="mx-1">/</span>
            <span aria-current="page">{isEdit ? 'Event Detail' : 'Create Event'}</span>
          </nav>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-[22px] font-medium text-[#1A1A1A] truncate">{form.name.trim() || 'Untitled'}</h1>
              {/* Status badge doubles as the Status & visibility trigger. */}
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMenu(menu === 'status' ? null : 'status')}
                  aria-haspopup="dialog"
                  aria-expanded={menu === 'status'}
                  aria-label={`Status: ${form.status}. Change status & visibility`}
                  className={`inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full text-xs text-[#1A1A1A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
                    menu === 'status' ? 'bg-[#FFF0E8]' : 'bg-[#F3F4F6] hover:bg-[#E5E7EB]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[form.status]}`} aria-hidden="true" />
                  {form.status}
                  <span className="text-[7px] text-[#9CA3AF] ml-0.5" aria-hidden="true">▼</span>
                </button>
                {menu === 'status' && (
                  <StatusVisibilityPanel
                    align="left"
                    status={form.status}
                    lockedStatuses={canPublish || savedStatus === 'Published' ? [] : ['Scheduled', 'Published']}
                    onStatusChange={(status) => set('status', status)}
                    scheduleDate={form.scheduledDate}
                    scheduleTime={form.scheduledTime}
                    onScheduleChange={(p) => patch({ scheduledDate: p.date ?? form.scheduledDate, scheduledTime: p.time ?? form.scheduledTime })}
                    scheduleError={errors.schedule}
                    passwordEnabled={form.passwordEnabled}
                    password={form.password}
                    onPasswordEnabledChange={(enabled) => set('passwordEnabled', enabled)}
                    onPasswordChange={(password) => set('password', password)}
                    passwordError={errors.password}
                    onMoveToTrash={
                      isEdit && savedStatus !== 'Trash' && onMoveToTrash
                        ? () => { setMenu(null); onMoveToTrash(event!); }
                        : undefined
                    }
                    onClose={() => setMenu(null)}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <IconButton label="Preview" icon="solar:eye-linear" onClick={() => setModal('preview')} />
              <IconButton label="Open preview in new tab" icon="solar:square-arrow-right-up-linear" onClick={openPreviewTab} />
              <IconButton
                label={isFullscreen ? 'Exit full screen' : 'Full screen'}
                icon={isFullscreen ? 'solar:minimize-square-linear' : 'solar:maximize-square-linear'}
                onClick={toggleFullscreen}
              />
              {showPublish && (
                // Wrapper carries the tooltip, since disabled buttons don't receive hover events everywhere.
                <span title={canPublish ? undefined : 'Submit to Review before publishing'} className="relative z-20 flex ml-auto sm:ml-1">
                  <button
                    ref={publishRef}
                    type="button"
                    disabled={!canPublish}
                    onClick={() => submit('publish')}
                    aria-describedby={canPublish ? undefined : publishHintId}
                    // z-20 keeps it above the panel's click-away layer, so you can pick a status and publish in one go.
                    className={`h-10 px-5 text-sm font-medium rounded-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
                      canPublish ? 'text-white bg-[#FF6115] hover:bg-[#E5540F]' : 'text-[#9CA3AF] bg-[#F3F4F6] cursor-not-allowed'
                    } ${publishHint && canPublish ? 'ring-4 ring-[#FF6115]/25' : ''}`}
                  >
                    {form.status === 'Scheduled' ? 'Schedule' : 'Publish'}
                  </button>
                  {!canPublish && (
                    <span id={publishHintId} className="sr-only">
                      Submit to Review before publishing
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-6">
          <Field label="Title / Event name" error={errors.name}>
            {(id) => (
              <input
                id={id}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Field here."
                aria-invalid={Boolean(errors.name)}
                className={inputClass(Boolean(errors.name))}
              />
            )}
          </Field>

          <Field label="Categories" error={errors.category}>
            {(id) => (
              <Dropdown
                open={menu === 'category'}
                onClose={() => setMenu(null)}
                fullWidth
                trigger={
                  <button
                    id={id}
                    type="button"
                    onClick={() => setMenu(menu === 'category' ? null : 'category')}
                    aria-haspopup="listbox"
                    aria-expanded={menu === 'category'}
                    aria-invalid={Boolean(errors.category)}
                    className={`${inputClass(Boolean(errors.category))} flex items-center gap-3 text-left`}
                  >
                    <span
                      className={`inline-flex items-center gap-2 h-8 px-3 rounded-full border text-xs ${
                        form.category ? 'border-[#FFB38F] bg-[#FFF5EF] text-[#FF6115]' : 'border-[#E5E7EB] text-[#6B7280]'
                      }`}
                    >
                      <Icon icon="solar:layers-linear" width={16} height={16} />
                      {form.category || 'Select Category'}
                    </span>
                    <span className="text-[8px] text-[#9CA3AF]">▼</span>
                  </button>
                }
              >
                {EVENT_CATEGORIES.map((c) => (
                  <MenuItem key={c} selected={c === form.category} onClick={() => { set('category', c); setMenu(null); }}>
                    {c}
                  </MenuItem>
                ))}
              </Dropdown>
            )}
          </Field>

          <Field label="Description" className="lg:col-span-2">
            {() => <RichTextEditor defaultValue={form.description} onChange={(html) => set('description', html)} ariaLabel="Description" />}
          </Field>

          <Field label="Choose Banner" className="lg:col-span-2">
            {() => <BannerDropzone value={form.banner} onChange={(banner) => set('banner', banner)} />}
          </Field>

          <Field label="Latitude" error={errors.latitude}>
            {(id) => (
              <input
                id={id}
                inputMode="decimal"
                value={form.latitude}
                onChange={(e) => set('latitude', e.target.value)}
                placeholder="Field here."
                aria-invalid={Boolean(errors.latitude)}
                className={inputClass(Boolean(errors.latitude))}
              />
            )}
          </Field>
          <Field label="Longitude" error={errors.longitude}>
            {(id) => (
              <input
                id={id}
                inputMode="decimal"
                value={form.longitude}
                onChange={(e) => set('longitude', e.target.value)}
                placeholder="Field here."
                aria-invalid={Boolean(errors.longitude)}
                className={inputClass(Boolean(errors.longitude))}
              />
            )}
          </Field>

          <Field label="Event Date : Start time → End time" error={errors.eventDate ?? errors.eventTime} asGroup>
            {() => (
              <DateTimeRange
                date={form.eventDate}
                start={form.eventStart}
                end={form.eventEnd}
                onChange={(p) => patch({ eventDate: p.date ?? form.eventDate, eventStart: p.start ?? form.eventStart, eventEnd: p.end ?? form.eventEnd })}
                dateInvalid={Boolean(errors.eventDate)}
                timeInvalid={Boolean(errors.eventTime)}
              />
            )}
          </Field>
          <Field label="Registration Deadline" error={errors.regTime} asGroup>
            {() => (
              <DateTimeRange
                date={form.regDate}
                start={form.regStart}
                end={form.regEnd}
                max={form.eventDate}
                onChange={(p) => patch({ regDate: p.date ?? form.regDate, regStart: p.start ?? form.regStart, regEnd: p.end ?? form.regEnd })}
                timeInvalid={Boolean(errors.regTime)}
              />
            )}
          </Field>

          <Field label="Event End Time, Send Survey" asGroup>
            {() => (
              <div className="flex flex-wrap items-center gap-3">
                <PickerInput size="md" type="date" placeholder="DD / MM / YYYY" value={form.surveyDate} min={form.eventDate} onChange={(v) => set('surveyDate', v)} className="basis-full sm:basis-auto sm:w-44" />
                <PickerInput size="md" type="time" placeholder="Set time" value={form.surveyTime} onChange={(v) => set('surveyTime', v)} className="flex-1 sm:flex-none sm:w-36" />
              </div>
            )}
          </Field>
          <Field label="QR Code Expire Date" asGroup>
            {() => (
              <div className="flex flex-wrap items-center gap-3">
                <PickerInput size="md" type="date" placeholder="DD / MM / YYYY" value={form.qrDate} onChange={(v) => set('qrDate', v)} className="basis-full sm:basis-auto sm:w-44" />
                <PickerInput size="md" type="time" placeholder="Set time" value={form.qrTime} onChange={(v) => set('qrTime', v)} className="flex-1 sm:flex-none sm:w-36" />
              </div>
            )}
          </Field>

          <Field label="Allow join" className="lg:col-span-2" asGroup>
            {() => <Toggle checked={form.allowJoin} onChange={(v) => set('allowJoin', v)} label="Active join" />}
          </Field>

          <Field label="Regis Form" className="lg:col-span-2" asGroup>
            {() => (
              <div className="space-y-3">
                {form.registrationForms.length > 0 && (
                  <ul className="space-y-2 lg:max-w-[calc(50%-10px)]">
                    {form.registrationForms.map((name) => (
                      <li key={name} className="flex items-center gap-3 h-11 px-3 border border-[#E5E7EB] rounded-lg">
                        <Icon icon="solar:document-text-linear" width={18} height={18} className="text-[#FF6115]" />
                        <span className="flex-1 text-sm text-[#1A1A1A] truncate">{name}</span>
                        <button
                          type="button"
                          onClick={() => set('registrationForms', form.registrationForms.filter((f) => f !== name))}
                          aria-label={`Remove ${name}`}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                        >
                          <Icon icon="solar:close-linear" width={14} height={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => setModal('form')}
                  disabled={form.registrationForms.length === REGISTRATION_FORM_TEMPLATES.length}
                  className="inline-flex items-center gap-2 h-10 px-4 text-sm text-[#FF6115] bg-[#FFF0E8] hover:bg-[#FFE4D4] rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                >
                  <Icon icon="solar:add-linear" width={16} height={16} />
                  Add Form
                </button>
              </div>
            )}
          </Field>

          <Field label="Select Collection" asGroup>
            {() => (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFF0E8]">
                <span className="w-10 h-10 rounded-lg bg-[#FF6115] flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:folder-linear" width={22} height={22} className="text-white" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs text-[#6B7280]">Collection</span>
                  <span className={`block text-sm font-semibold truncate ${selectedCollection ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}>
                    {selectedCollection?.name ?? 'No collection selected'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setModal('collection')}
                  className="h-8 px-3 text-xs text-[#FF6115] bg-white rounded-md hover:bg-[#FFF5EF] transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                >
                  {selectedCollection ? 'Change' : 'Select'}
                </button>
              </div>
            )}
          </Field>
        </div>

        {/* Footer */}
        <div className="mt-6 px-4 sm:px-6 py-6 border-t border-[#E5E7EB] flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {reviewFlow ? (
            <>
              {/* Saves with whatever status is picked in Status & visibility. */}
              <FooterButton variant="secondary" onClick={() => submit('save')}>
                {form.status === 'Draft' ? 'Save draft' : 'Save'}
              </FooterButton>
              <FooterButton onClick={() => submit('review')}>Submit to Review</FooterButton>
            </>
          ) : (
            <>
              <FooterButton variant="secondary" onClick={leave}>Cancel</FooterButton>
              <FooterButton onClick={() => submit('save')}>{savedStatus === 'Pending' ? 'Save' : 'Save Changes'}</FooterButton>
            </>
          )}
        </div>

        {/* Modals live inside the card so they still show in full-screen mode. */}
        {modal === 'preview' && (
          <EventPreviewModal {...previewData()} onClose={() => setModal(null)} />
        )}
        {modal === 'collection' && (
          <OptionPickerModal
            title="Select Collection"
            icon="solar:folder-linear"
            options={mockCollections.map((c) => ({ value: c.id, label: c.name, description: `${c.files.toLocaleString()} files · ${c.linkedEvent}` }))}
            initialValue={form.collectionId}
            confirmLabel="Select Collection"
            onConfirm={(id) => { set('collectionId', id); setModal(null); }}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'form' && (
          <OptionPickerModal
            title="Add Registration Form"
            icon="solar:document-text-linear"
            options={REGISTRATION_FORM_TEMPLATES.map((name) => ({
              value: name,
              label: name,
              description: form.registrationForms.includes(name) ? 'Already added' : undefined,
              disabled: form.registrationForms.includes(name),
            }))}
            confirmLabel="Add Form"
            onConfirm={(name) => { set('registrationForms', [...form.registrationForms, name]); setModal(null); }}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'discard' && (
          <DeleteConfirmationModal
            title="Discard changes?"
            confirmLabel="Discard"
            message="Your unsaved changes to this event will be lost."
            onConfirm={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              onBack();
            }}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </div>
  );
}

// --- Local building blocks ---

function Field({ label, error, className = '', asGroup, children }: {
  label: string;
  error?: string;
  className?: string;
  /** Use a fieldset/legend for multi-control fields. */
  asGroup?: boolean;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  const labelClass = 'block text-[15px] font-medium text-[#1A1A1A] mb-3';
  const body = (
    <>
      {children(id)}
      {error && <p className="mt-2 text-xs text-[#DC2626]">{error}</p>}
    </>
  );
  return asGroup ? (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className={labelClass}>{label}</legend>
      {body}
    </fieldset>
  ) : (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {body}
    </div>
  );
}

function DateTimeRange({ date, start, end, max, onChange, dateInvalid, timeInvalid }: {
  date: string;
  start: string;
  end: string;
  max?: string;
  onChange: (patch: { date?: string; start?: string; end?: string }) => void;
  dateInvalid?: boolean;
  timeInvalid?: boolean;
}) {
  return (
    // Wraps the date onto its own line on phones; one row from tablet up.
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
      <PickerInput size="md" type="date" placeholder="DD / MM / YYYY" value={date} max={max} invalid={dateInvalid} onChange={(v) => onChange({ date: v })} className="basis-full sm:basis-auto sm:flex-[1.3] sm:min-w-0 sm:max-w-44" />
      <PickerInput size="md" type="time" placeholder="Start time" value={start} invalid={timeInvalid} onChange={(v) => onChange({ start: v })} className="flex-1 min-w-0 sm:max-w-36" />
      <Icon icon="solar:arrow-right-linear" width={18} height={18} className="text-[#1A1A1A] flex-shrink-0" />
      <PickerInput size="md" type="time" placeholder="End time" value={end} min={start} invalid={timeInvalid} onChange={(v) => onChange({ end: v })} className="flex-1 min-w-0 sm:max-w-36" />
    </div>
  );
}

function IconButton({ label, icon, active, onClick }: { label: string; icon: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={active}
      title={label}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        active ? 'bg-[#FFF0E8] text-[#FF6115]' : 'text-[#374151] hover:bg-[#F9FAFB]'
      }`}
    >
      <Icon icon={icon} width={22} height={22} />
    </button>
  );
}

function Dropdown({ open, onClose, trigger, align = 'left', fullWidth, children }: {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  align?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className="relative">
      {trigger}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div
            role="menu"
            className={`absolute top-full mt-1 z-20 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5 ${
              fullWidth ? 'left-0 right-0' : `w-48 ${align === 'right' ? 'right-0' : 'left-0'}`
            }`}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ selected, destructive, onClick, children }: {
  selected?: boolean;
  destructive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
        selected
          ? 'text-[#FF6115] bg-[#FFF0E8] font-medium'
          : destructive
            ? 'text-[#DC2626] hover:bg-[#FEF2F2]'
            : 'text-[#4B5563] hover:bg-[#F9FAFB]'
      }`}
    >
      {children}
      {selected && <Icon icon="solar:check-linear" width={14} height={14} />}
    </button>
  );
}

function FooterButton({ variant = 'primary', onClick, children }: { variant?: 'primary' | 'secondary'; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 px-5 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        variant === 'primary' ? 'bg-[#FF6115] hover:bg-[#E5540F] text-white' : 'bg-white border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]'
      }`}
    >
      {children}
    </button>
  );
}
