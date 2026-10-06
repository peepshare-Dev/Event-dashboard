import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { STATUS_DOT } from '../../components/ui/StatusBadge';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import EventPreviewModal, { openEventPreviewTab } from '../../components/set-event/EventPreviewModal';
import StatusVisibilityPanel from '../../components/set-event/StatusVisibilityPanel';
import EventFormSection from '../../components/set-event/form/EventFormSection';
import CollectionSelector from '../../components/set-event/form/CollectionSelector';
import StickyActionBar from '../../components/set-event/form/StickyActionBar';
import CopyIdButton from '../../components/set-event/CopyIdButton';
import InformationSection from './event-form/InformationSection';
import ScheduleSection from './event-form/ScheduleSection';
import LocationSection from './event-form/LocationSection';
import RegistrationSection from './event-form/RegistrationSection';
import AttendeeFormSection from './event-form/AttendeeFormSection';
import SurveyFormSection from './event-form/SurveyFormSection';
import CommunicationSection from './event-form/CommunicationSection';
import { fromForm, joinDateTime, toForm, validate, type Errors, type FormState } from './event-form/formModel';
import type { SetEvent, SetEventStatus } from '../../data/setEvents';
import type { FormTemplate } from '../../data/formTemplates';

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
  /** Master Regis / Survey templates the event forms can start from. */
  formTemplates: FormTemplate[];
}

/** draft → Draft, review → Pending, publish → Published/Private/Scheduled, save → keep the chosen status. */
export type SaveAction = 'draft' | 'review' | 'publish' | 'save';

/** Shared by the page body and the sticky footer so both line up. */
const CONTENT_WIDTH = 'max-w-[960px]';

export default function EventFormPage({ event, nextId, onBack, onSave, onMoveToTrash, highlightPublish, onDirtyChange, formTemplates }: EventFormPageProps) {
  const isEdit = Boolean(event);
  const initial = useMemo(() => toForm(event), [event]);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [modal, setModal] = useState<'preview' | 'discard' | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const publishRef = useRef<HTMLButtonElement>(null);
  const [publishHint, setPublishHint] = useState(Boolean(highlightPublish));

  // After a failed save, re-check with the same rules as the user edits.
  const [checkedComplete, setCheckedComplete] = useState<boolean | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const patch = (changes: Partial<FormState>) => {
    const next = { ...form, ...changes };
    setForm(next);
    if (checkedComplete !== null) setErrors(validate(next, checkedComplete));
  };
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => patch({ [key]: value } as Partial<FormState>);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  useEffect(() => {
    rootRef.current?.closest('main')?.scrollTo({ top: 0, behavior: highlightPublish ? 'smooth' : 'auto' });
    if (highlightPublish) publishRef.current?.focus({ preventScroll: true });
    const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
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
    startTime: joinDateTime(form.eventStartDate, form.eventStartTime),
    endTime: joinDateTime(form.eventEndDate, form.eventEndTime),
  });

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen?.();
  };

  const leave = () => (isDirty ? setModal('discard') : onBack());

  // Scrolls only the page's own scroller (scrollIntoView would also shift the app shell under the header).
  const scrollToElement = (target: Element | null | undefined, block: 'start' | 'center') => {
    const scroller = isFullscreen ? rootRef.current : rootRef.current?.closest('main');
    if (!target || !scroller) return;
    const view = scroller.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    const offset = block === 'start' ? box.top - view.top - 24 : box.top - view.top - (view.height - box.height) / 2;
    scroller.scrollBy({ top: offset, behavior: 'smooth' });
  };

  const scrollToFirstError = () => {
    const target = rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
    scrollToElement(target, 'center');
    target?.focus?.({ preventScroll: true });
  };


  const resultingStatus = (action: SaveAction): SetEventStatus => {
    if (action === 'draft') return 'Draft';
    if (action === 'review') return 'Pending';
    if (action === 'publish') return form.status === 'Scheduled' || form.status === 'Private' ? form.status : 'Published';
    return form.status;
  };

  const submit = (action: SaveAction) => {
    const status = resultingStatus(action);
    // Drafts may be incomplete; anything heading towards attendees needs every required field.
    const complete = action !== 'draft' && status !== 'Draft';
    const nextErrors = validate({ ...form, status }, complete);
    setErrors(nextErrors);
    setCheckedComplete(complete);
    if (Object.keys(nextErrors).length) {
      // Schedule and password live in the Status & visibility panel — open it to show the problem.
      if (nextErrors.schedule || nextErrors.password) setStatusOpen(true);
      else requestAnimationFrame(scrollToFirstError);
      return;
    }
    if (document.fullscreenElement) document.exitFullscreen();
    onSave(fromForm(form, event, event?.id ?? nextId, status), action);
  };

  const savedStatus = event?.status;
  // Publishing opens up once the event has been through review (or already is live in some form).
  const canPublish = savedStatus === 'Pending' || savedStatus === 'Private' || savedStatus === 'Scheduled';
  // New events use Create Event; already-published and trashed events are just saved.
  const showPublish = isEdit && savedStatus !== 'Published' && savedStatus !== 'Trash';
  const publishHintId = useId();
  // New events and drafts go through review; everything else is simply saved.
  const reviewFlow = !isEdit || savedStatus === 'Draft';
  const errorCount = Object.keys(errors).length;

  // Status, preview and full screen sit in the Event Information card header.
  const headerActions = (
    <>
      {/* Status badge doubles as the Status & visibility trigger. */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setStatusOpen(!statusOpen)}
          aria-haspopup="dialog"
          aria-expanded={statusOpen}
          aria-label={`Status: ${form.status}. Change status & visibility`}
          className={`inline-flex items-center gap-1.5 h-9 pl-3 pr-2.5 rounded-full text-xs text-[#1A1A1A] border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
            statusOpen ? 'bg-[#FFF0E8] border-[#FFD9C4]' : 'bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[form.status]}`} aria-hidden="true" />
          {form.status}
          <Icon icon="solar:alt-arrow-down-linear" width={12} height={12} className="text-[#9CA3AF]" aria-hidden="true" />
        </button>
        {statusOpen && (
          <StatusVisibilityPanel
            align="right"
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
                ? () => {
                    setStatusOpen(false);
                    onMoveToTrash(event!);
                  }
                : undefined
            }
            onClose={() => setStatusOpen(false)}
          />
        )}
      </div>
      <IconButton label="Preview" icon="solar:eye-linear" onClick={() => setModal('preview')} />
      <IconButton label="Open preview in new tab" icon="solar:square-arrow-right-up-linear" onClick={() => openEventPreviewTab(previewData())} />
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
            className={`h-10 px-5 text-sm font-medium rounded-[10px] transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
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
    </>
  );

  return (
    <div ref={rootRef} className={`min-h-full flex flex-col ${isFullscreen ? 'h-full overflow-y-auto bg-[#F5F7FA]' : ''}`}>
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 pb-8 lg:pb-10">
        <div className={`${CONTENT_WIDTH} mx-auto`}>
          {/* Page header */}
          <div>
            <div className="min-w-0">
              {isEdit ? (
                <div className="flex items-baseline gap-2 min-w-0 text-2xl sm:text-[28px] font-semibold leading-tight">
                  <CopyIdButton id={event!.id} />
                  <h1 className="text-[#1A1A1A] truncate">{form.name.trim() || 'Untitled'}</h1>
                </div>
              ) : (
                <h1 className="text-2xl sm:text-[28px] font-semibold leading-tight text-[#1A1A1A]">Create Event</h1>
              )}
              <p className="mt-1.5 text-sm text-[#6B7280] max-w-xl">
                {isEdit
                  ? 'Update the event details, registration, schedule, location, and attendee experience.'
                  : 'Create a new event and configure its registration, schedule, location, and attendee experience.'}
              </p>
            </div>

          </div>

          {/* One card per group of fields. New sections slot into this list. */}
          <div className="mt-5 space-y-4 sm:space-y-6">
            <InformationSection form={form} patch={patch} errors={errors} headerActions={headerActions} />
            <ScheduleSection form={form} patch={patch} errors={errors} />
            <LocationSection form={form} patch={patch} errors={errors} />
            <RegistrationSection form={form} patch={patch} errors={errors} />
            <EventFormSection id="section-collection" icon="solar:folder-linear" title="Collection" description="Choose where event-related media will be stored.">
              <CollectionSelector value={form.collectionId} onChange={(collectionId) => set('collectionId', collectionId)} />
            </EventFormSection>
            <AttendeeFormSection form={form} patch={patch} errors={errors} templates={formTemplates.filter((t) => t.kind === 'registration')} />
            <CommunicationSection form={form} patch={patch} errors={errors} />
            <SurveyFormSection form={form} patch={patch} errors={errors} templates={formTemplates.filter((t) => t.kind === 'survey')} />
          </div>
        </div>
      </div>

      <StickyActionBar
        maxWidth={CONTENT_WIDTH}
        note={
          errorCount > 0 ? (
            <button type="button" onClick={scrollToFirstError} className="inline-flex items-center gap-1.5 text-[#DC2626] font-medium hover:underline underline-offset-2">
              <Icon icon="solar:danger-circle-linear" width={16} height={16} className="flex-shrink-0" />
              {errorCount === 1 ? '1 field needs attention' : `${errorCount} fields need attention`}
            </button>
          ) : (
            <span>
              Required fields are marked with an asterisk (<span className="text-[#DC2626]">*</span>).
            </span>
          )
        }
        tertiary={{ label: 'Cancel', onClick: leave }}
        {...(reviewFlow
          ? {
              // Saves with whatever status is picked in Status & visibility (Draft by default).
              secondary: { label: form.status === 'Draft' ? 'Save Draft' : 'Save', onClick: () => submit('save') },
              primary: { label: isEdit ? 'Submit to Review' : 'Create Event', onClick: () => submit('review') },
            }
          : { primary: { label: savedStatus === 'Pending' ? 'Save' : 'Save Changes', onClick: () => submit('save') } })}
      />

      {/* Modals live inside the page root so they still show in full-screen mode. */}
      {modal === 'preview' && <EventPreviewModal {...previewData()} onClose={() => setModal(null)} />}
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
  );
}

// --- Local building blocks ---

function IconButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#374151] hover:bg-[#F3F4F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
    >
      <Icon icon={icon} width={22} height={22} />
    </button>
  );
}
