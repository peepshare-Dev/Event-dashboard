import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { STATUS_DOT } from '../../components/ui/StatusBadge';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import EventPreviewModal, { openEventPreviewTab } from '../../components/set-event/EventPreviewModal';
import StatusVisibilityPanel from '../../components/set-event/StatusVisibilityPanel';
import EventFormSection from '../../components/set-event/form/EventFormSection';
import FormStepper from '../../components/set-event/form/FormStepper';
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
import {
  errorSection,
  fromForm,
  joinDateTime,
  sectionStatuses,
  toForm,
  validate,
  type Errors,
  type FormState,
  type SectionId,
} from './event-form/formModel';
import type { SetEvent, SetEventStatus } from '../../data/setEvents';
import type { FormTemplate } from '../../data/formTemplates';
import { useLanguage, useT } from '@/i18n';

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

// Each card's element id is `section-<id>`.
const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'information', label: 'Event Information' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'location', label: 'Location' },
  { id: 'registration', label: 'Registration' },
  { id: 'collection', label: 'Collection' },
  { id: 'event-form', label: 'Event Form' },
  { id: 'communication', label: 'Communication' },
  { id: 'survey-form', label: 'Survey Form' },
];

// Create and Edit Event both go through these steps.
const STEPS: { label: string; sections: SectionId[] }[] = [
  { label: 'Event Info', sections: ['information', 'schedule'] },
  { label: 'Venue & Registration', sections: ['location', 'registration'] },
  { label: 'Attendee Experience', sections: ['collection', 'event-form', 'survey-form'] },
  { label: 'Communication', sections: ['communication'] },
];
const sectionLabel = (id: SectionId) => SECTIONS.find((sec) => sec.id === id)!.label;

const stepOf = (section: SectionId | undefined) => STEPS.findIndex((st) => section && st.sections.includes(section));

export default function EventFormPage({ event, nextId, onBack, onSave, onMoveToTrash, highlightPublish, onDirtyChange, formTemplates }: EventFormPageProps) {
  const t = useT();
  const { lang } = useLanguage();
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
  // Current step and the furthest one that can be opened. Create Event unlocks steps one by one; Edit Event opens them all.
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(isEdit ? STEPS.length - 1 : 0);

  // The element that scrolls this page (the page itself in full-screen mode).
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  useEffect(() => setScroller(isFullscreen ? rootRef.current : (rootRef.current?.closest('main') ?? null)), [isFullscreen]);

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
      else {
        // Open the first step with a problem.
        const first = Math.min(...Object.keys(nextErrors).map((k) => stepOf(errorSection(k, form))).filter((i) => i >= 0));
        if (Number.isFinite(first) && first !== step) goToStep(first, scrollToFirstError);
        else requestAnimationFrame(scrollToFirstError);
      }
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
  // Errors only count once their step has been reached; the footer counts the ones on screen.
  const errorsWhere = (keep: (step: number) => boolean) =>
    Object.fromEntries(Object.entries(errors).filter(([k]) => keep(stepOf(errorSection(k, form)))));
  const errorCount = Object.keys(errorsWhere((i) => i === step || i === -1)).length;
  const statuses = sectionStatuses(form, errorsWhere((i) => i <= reached));
  const steps = STEPS.map((st) => ({ label: t(st.label), sections: st.sections.map((id) => ({ label: t(sectionLabel(id)), status: statuses[id] })) }));

  const goToStep = (i: number, then?: () => void) => {
    setStep(i);
    setReached((r) => Math.max(r, i));
    scroller?.scrollTo({ top: 0 });
    if (then) setTimeout(then, 50);
  };

  // Next: in Create Event the current step must be complete before moving on.
  const next = () => {
    if (isEdit) return goToStep(step + 1);
    const stepErrors = Object.fromEntries(
      Object.entries(validate(form, true)).filter(([k]) => STEPS[step].sections.includes(errorSection(k, form)!)),
    );
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      setCheckedComplete(true);
      requestAnimationFrame(scrollToFirstError);
      return;
    }
    setErrors({});
    setCheckedComplete(null);
    goToStep(step + 1);
  };

  // Status, preview and full screen sit in the page header, next to the title.
  const headerActions = (
    <>
      {/* Status badge doubles as the Status & visibility trigger. */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setStatusOpen(!statusOpen)}
          aria-haspopup="dialog"
          aria-expanded={statusOpen}
          aria-label={t('Status: {status}. Change status & visibility', { status: t(form.status) })}
          className={`inline-flex items-center gap-1.5 h-9 pl-3 pr-2.5 rounded-full text-xs text-[#1A1A1A] border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
            statusOpen ? 'bg-[#FFF0E8] border-[#FFD9C4]' : 'bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[form.status]}`} aria-hidden="true" />
          {t(form.status)}
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
      <IconButton label={t('Preview')} icon="solar:eye-linear" onClick={() => setModal('preview')} />
      <IconButton label={t('Open preview in new tab')} icon="solar:square-arrow-right-up-linear" onClick={() => openEventPreviewTab(previewData(), lang)} />
      <IconButton
        label={isFullscreen ? t('Exit full screen') : t('Full screen')}
        icon={isFullscreen ? 'solar:minimize-square-linear' : 'solar:maximize-square-linear'}
        onClick={toggleFullscreen}
      />
      {showPublish && (
        // Wrapper carries the tooltip, since disabled buttons don't receive hover events everywhere.
        <span title={canPublish ? undefined : t('Submit to Review before publishing')} className="relative z-20 flex ml-auto sm:ml-1">
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
            {form.status === 'Scheduled' ? t('[verb] Schedule') : t('Publish')}
          </button>
          {!canPublish && (
            <span id={publishHintId} className="sr-only">
              {t('Submit to Review before publishing')}
            </span>
          )}
        </span>
      )}
    </>
  );

  const sectionCards: Record<SectionId, React.ReactNode> = {
    information: <InformationSection form={form} patch={patch} errors={errors} />,
    schedule: <ScheduleSection form={form} patch={patch} errors={errors} />,
    location: <LocationSection form={form} patch={patch} errors={errors} />,
    registration: <RegistrationSection form={form} patch={patch} errors={errors} />,
    collection: (
      <EventFormSection id="section-collection" icon="solar:folder-linear" title={t('Collection')} description={t('Choose where event-related media will be stored.')}>
        <CollectionSelector value={form.collectionId} onChange={(collectionId) => set('collectionId', collectionId)} />
      </EventFormSection>
    ),
    'event-form': <AttendeeFormSection form={form} patch={patch} errors={errors} templates={formTemplates.filter((t) => t.kind === 'registration')} />,
    communication: <CommunicationSection form={form} patch={patch} errors={errors} />,
    'survey-form': <SurveyFormSection form={form} patch={patch} errors={errors} templates={formTemplates.filter((t) => t.kind === 'survey')} />,
  };
  const lastStep = step === STEPS.length - 1;
  // New events and drafts: Save (keeps the picked status, Draft by default) + Create Event / Submit to Review.
  // Everything else is simply saved, from any step.
  const saveAction = reviewFlow
    ? { label: form.status === 'Draft' ? t('Save Draft') : t('Save'), onClick: () => submit('save') }
    : { label: savedStatus === 'Pending' ? t('Save') : t('Save Changes'), onClick: () => submit('save') };
  const finalAction = reviewFlow ? { label: isEdit ? t('Submit to Review') : t('Create Event'), onClick: () => submit('review') } : saveAction;

  return (
    <div ref={rootRef} className={`min-h-full flex flex-col ${isFullscreen ? 'h-full overflow-y-auto bg-[#F5F7FA]' : ''}`}>
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 pb-8 lg:pb-10">
        <div className={`${CONTENT_WIDTH} mx-auto`}>
          {/* Page header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              {isEdit ? (
                <div className="flex items-baseline gap-2 min-w-0 text-2xl sm:text-[28px] font-semibold leading-tight">
                  <CopyIdButton id={event!.id} />
                  <h1 className="text-[#1A1A1A] truncate">{form.name.trim() || t('Untitled')}</h1>
                </div>
              ) : (
                <h1 className="text-2xl sm:text-[28px] font-semibold leading-tight text-[#1A1A1A]">{t('Create Event')}</h1>
              )}
              <p className="mt-1.5 text-sm text-[#6B7280] max-w-xl">
                {isEdit
                  ? t('Update the event details, registration, schedule, location, and attendee experience.')
                  : t('Create a new event and configure its registration, schedule, location, and attendee experience.')}
              </p>
            </div>
            {/* Status and preview stay reachable on every step. */}
            <div className="flex items-center gap-1 sm:gap-2">{headerActions}</div>
          </div>

          <div className="mt-5">
            <FormStepper steps={steps} current={step} reached={reached} onStepClick={(i) => goToStep(i)} showSections={isEdit} />
          </div>

          {/* One card per group of fields. New sections slot into SECTIONS, sectionCards and STEPS. */}
          <div className="mt-4 lg:mt-5 space-y-4 sm:space-y-6">
            {STEPS[step].sections.map((id) => (
              <Fragment key={id}>{sectionCards[id]}</Fragment>
            ))}
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
        tertiary={step > 0 ? { label: t('Back'), onClick: () => goToStep(step - 1) } : { label: t('Cancel'), onClick: leave }}
        secondary={lastStep && !reviewFlow ? undefined : saveAction}
        primary={lastStep ? finalAction : { label: t('Next'), onClick: next }}
      />

      {/* Modals live inside the page root so they still show in full-screen mode. */}
      {modal === 'preview' && <EventPreviewModal {...previewData()} onClose={() => setModal(null)} />}
      {modal === 'discard' && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved changes to this event will be lost.')}
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
