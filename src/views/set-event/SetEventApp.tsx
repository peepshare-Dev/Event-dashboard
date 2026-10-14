import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import BackToTop from '../../components/ui/BackToTop';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import EventWorkspaceSidebar from '../../components/set-event/EventWorkspaceSidebar';
import SetEventList from './SetEventList';
import EventFormPage, { type SaveAction } from './EventFormPage';
import FormLibrary from './FormLibrary';
import EventOverview from './workspace/EventOverview';
import EventCollection from './workspace/EventCollection';
import EventQrLinks from './workspace/EventQrLinks';
import EventUsers from './workspace/EventUsers';
import EventActivityLog from './workspace/EventActivityLog';
import CloudManagement from '../CloudManagement';
import Collections from '../Collections';
import ActivityLog from '../ActivityLog';
import SystemSettings from '../SystemSettings';
import { setEventNavSections, type EventSectionId } from '../../data/navigation';
import { CURRENT_AUTHOR, formatEventDateTime, setEventsSeed, withDetails, type SetEvent } from '../../data/setEvents';
import { formTemplatesSeed, type FormTemplate } from '../../data/formTemplates';
import { diffActivity, sampleActivity, type EventActivity } from '../../data/eventActivity';
import { useT } from '@/i18n';

type NavId = 'event-list' | 'regis-forms' | 'survey-forms' | 'cloud' | 'collections' | 'activity' | 'settings';

// Inside Event List: the table, the Create Event page, or one saved event's workspace.
type View =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'event'; id: number; section: EventSectionId; highlightPublish?: boolean };

interface SetEventAppProps {
  onSwitchService: () => void;
  onLogout: () => void;
}

export default function SetEventApp({ onSwitchService, onLogout }: SetEventAppProps) {
  const t = useT();
  const [events, setEvents] = useState<SetEvent[]>(setEventsSeed);
  // Master Regis / Survey templates (Regis Form and Survey Form menus).
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>(formTemplatesSeed);
  // Changes made in this session (Activity logs); older history comes from sampleActivity.
  const [activity, setActivity] = useState<EventActivity[]>([]);
  const log = (before: SetEvent | undefined, after: SetEvent) => setActivity((list) => [...diffActivity(before, after), ...list]);
  const [activeNav, setActiveNav] = useState<NavId>('event-list');
  const [view, setView] = useState<View>({ kind: 'list' });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Just-duplicated event, highlighted in the list for a few seconds.
  const [highlightId, setHighlightId] = useState<number | null>(null);
  useEffect(() => {
    if (highlightId == null) return;
    const timer = setTimeout(() => setHighlightId(null), 4000);
    return () => clearTimeout(timer);
  }, [highlightId]);
  const [deleting, setDeleting] = useState<SetEvent | null>(null);
  // Navigation waiting on "Discard changes?" while the event form has unsaved edits.
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const formDirty = useRef(false);
  const handleDirtyChange = useCallback((dirty: boolean) => {
    formDirty.current = dirty;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Start each event page at the top (the form handles its own smooth scroll after Submit to Review).
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (view.kind !== 'list' && !(view.kind === 'event' && view.highlightPublish)) mainRef.current?.scrollTo(0, 0);
  }, [view]);

  const openEvent = view.kind === 'event' ? events.find((e) => e.id === view.id) : undefined;
  const nextId = Math.max(...events.map((e) => e.id), 0) + 1;
  const inWorkspace = activeNav === 'event-list' && view.kind === 'event' && Boolean(openEvent);

  /** Runs `go` now, or after confirming if the event form has unsaved changes. */
  const guarded = (go: () => void) => {
    if (formDirty.current) setPendingNav(() => go);
    else go();
  };

  const backToList = () => guarded(() => setView({ kind: 'list' }));

  const upsert = (saved: SetEvent) =>
    setEvents((list) =>
      list.some((e) => e.id === saved.id) ? list.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...list],
    );

  const handleSave = (saved: SetEvent, action: SaveAction) => {
    formDirty.current = false;
    log(events.find((e) => e.id === saved.id), saved);
    upsert(saved);
    // Submitting for review keeps the event open (now Pending) so it can be published next.
    setView(action === 'review' ? { kind: 'event', id: saved.id, section: 'detail', highlightPublish: true } : { kind: 'list' });
    const name = saved.name || t('Untitled');
    const messages: Partial<Record<SetEvent['status'], string>> = {
      Draft: t('“{name}” saved as draft', { name }),
      Pending: t('“{name}” submitted for review — publish when ready', { name }),
      Published: t('“{name}” published', { name }),
      Private: t('“{name}” published privately', { name }),
      Scheduled: t('“{name}” scheduled for {date}', { name, date: formatEventDateTime(saved.details?.scheduledAt ?? '') }),
    };
    setToast(action === 'save' && saved.status !== 'Draft' ? t('“{name}” updated', { name }) : (messages[saved.status] ?? t('“{name}” updated', { name })));
  };

  // Changes made directly in a workspace section (collection, QR links) apply immediately.
  const updateEvent = (id: number, patch: Parameters<typeof withDetails>[1], message: string) => {
    const before = events.find((e) => e.id === id);
    if (before) log(before, withDetails(before, patch));
    setEvents((list) => list.map((e) => (e.id === id ? withDetails(e, patch) : e)));
    setToast(message);
  };

  // Copies everything set up on the event as a new Draft.
  // Registrants, QR links, scheduled publish and password belong to the original and are not copied.
  const duplicateEvent = (source: SetEvent) => {
    const copy: SetEvent = {
      ...structuredClone(source),
      id: nextId,
      name: `${source.name || 'Untitled'} (Copy)`,
      author: CURRENT_AUTHOR,
      status: 'Draft',
      registrants: 0,
    };
    if (copy.details) copy.details = { ...copy.details, qrLinks: [], scheduledAt: '', password: '' };
    log(undefined, copy);
    // Right below the original; the list highlights it and the user opens it when ready.
    setEvents((list) => {
      const index = list.findIndex((e) => e.id === source.id);
      return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
    });
    setHighlightId(copy.id);
    setToast(t('“{name}” created as a draft', { name: copy.name }));
  };

  // Deleting from any tab moves the event to Trash; deleting from Trash is permanent.
  const handleConfirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
    if (target.status !== 'Trash') log(target, { ...target, status: 'Trash' });
    setEvents((list) =>
      target.status === 'Trash'
        ? list.filter((e) => e.id !== target.id)
        : list.map((e) => (e.id === target.id ? { ...e, status: 'Trash' } : e)),
    );
    setDeleting(null);
  };

  const navigateService = (id: string) =>
    guarded(() => {
      setActiveNav(id as NavId);
      setView({ kind: 'list' });
    });

  const renderWorkspace = (event: SetEvent, section: EventSectionId, highlightPublish?: boolean) => {
    const goToSection = (next: EventSectionId) => guarded(() => setView({ kind: 'event', id: event.id, section: next }));
    switch (section) {
      case 'overview':
        return <EventOverview event={event} onBack={backToList} onEdit={() => goToSection('detail')} onOpenQr={() => goToSection('qr')} />;
      case 'collection':
        return (
          <EventCollection
            event={event}
            onBack={backToList}
            onChange={(collectionId, message) => updateEvent(event.id, { collectionId }, message)}
          />
        );
      case 'qr':
        return (
          <EventQrLinks event={event} onBack={backToList} onChange={(qrLinks, message) => updateEvent(event.id, { qrLinks }, message)} />
        );
      case 'users':
        return <EventUsers event={event} onBack={backToList} />;
      case 'activity': {
        const logged = activity.filter((a) => a.eventId === event.id);
        // Events created in this session have their full history already; older ones get sample history.
        const history = logged.some((a) => a.action === 'Created') ? logged : [...sampleActivity(event), ...logged];
        return <EventActivityLog event={event} activity={history} onBack={backToList} />;
      }
      case 'detail':
        return (
          <EventFormPage
            // Status in the key remounts the form after a save that keeps it open, so it reloads as the saved event.
            key={`${event.id}-${event.status}`}
            event={event}
            nextId={nextId}
            highlightPublish={highlightPublish}
            onDirtyChange={handleDirtyChange}
            formTemplates={formTemplates}
            onBack={() => setView({ kind: 'list' })}
            onSave={handleSave}
            onMoveToTrash={(ev) => {
              formDirty.current = false;
              setView({ kind: 'list' });
              setDeleting(ev);
            }}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {inWorkspace && view.kind === 'event' ? (
        <EventWorkspaceSidebar
          serviceSections={setEventNavSections}
          activeServiceNav={activeNav}
          onServiceNavigate={navigateService}
          section={view.section}
          onSectionChange={(section) => guarded(() => setView({ kind: 'event', id: view.id, section }))}
          onBack={backToList}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
      ) : (
        <Sidebar
          active={activeNav}
          onNavigate={navigateService}
          sections={setEventNavSections}
          logoTitle="PEEP SHARE"
          logoSubtitle="Set Event"
          size="lg"
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileNavOpen(true)} onSwitchService={onSwitchService} onLogout={onLogout} />

        <main ref={mainRef} className="relative flex-1 overflow-y-auto overflow-x-hidden">
          {activeNav === 'event-list' && (
            <>
              {/* Kept mounted so tabs, filters and page survive a trip into an event. */}
              <div hidden={view.kind !== 'list'}>
                <SetEventList
                  events={events}
                  onCreate={() => setView({ kind: 'create' })}
                  onOpen={(ev, section) => setView({ kind: 'event', id: ev.id, section })}
                  onDelete={setDeleting}
                  onDuplicate={duplicateEvent}
                  highlightId={highlightId}
                />
              </div>
              {view.kind === 'create' && (
                <EventFormPage
                  key="new"
                  nextId={nextId}
                  onDirtyChange={handleDirtyChange}
                  formTemplates={formTemplates}
                  onBack={() => setView({ kind: 'list' })}
                  onSave={handleSave}
                />
              )}
              {view.kind === 'event' && openEvent && renderWorkspace(openEvent, view.section, view.highlightPublish)}
            </>
          )}
          {(activeNav === 'regis-forms' || activeNav === 'survey-forms') && (
            <FormLibrary
              key={activeNav}
              kind={activeNav === 'regis-forms' ? 'registration' : 'survey'}
              events={events}
              templates={formTemplates}
              onTemplatesChange={(next, message) => {
                setFormTemplates(next);
                setToast(message);
              }}
              onOpenEvent={(ev) => {
                setActiveNav('event-list');
                setView({ kind: 'event', id: ev.id, section: 'detail' });
              }}
            />
          )}
          {activeNav === 'cloud' && <CloudManagement />}
          {activeNav === 'collections' && <Collections />}
          {activeNav === 'activity' && <ActivityLog />}
          {activeNav === 'settings' && <SystemSettings />}
          <BackToTop />
        </main>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] text-white text-sm rounded-xl shadow-lg max-w-[calc(100vw-32px)]"
        >
          <Icon icon="solar:check-circle-bold" width={18} height={18} className="text-[#22C55E] flex-shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}

      {deleting && (
        <DeleteConfirmationModal
          title={deleting.status === 'Trash' ? t('Delete event permanently?') : t('Move event to Trash?')}
          confirmLabel={deleting.status === 'Trash' ? t('Delete Permanently') : t('Move to Trash')}
          message={
            deleting.status === 'Trash' ? (
              <>
                <span className="font-semibold text-[#1A1A1A]">{deleting.name}</span> ({deleting.id}){' '}
                {t('will be deleted permanently. This cannot be undone.')}
              </>
            ) : (
              <>
                <span className="font-semibold text-[#1A1A1A]">{deleting.name}</span> ({deleting.id}){' '}
                {t('will be moved to Trash. You can restore it later by editing it from the Trash tab.')}
              </>
            )
          }
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}

      {pendingNav && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved changes to this event will be lost.')}
          onConfirm={() => {
            formDirty.current = false;
            const go = pendingNav;
            setPendingNav(null);
            go();
          }}
          onClose={() => setPendingNav(null)}
        />
      )}
    </div>
  );
}
