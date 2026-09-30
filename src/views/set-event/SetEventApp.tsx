import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import EventWorkspaceSidebar from '../../components/set-event/EventWorkspaceSidebar';
import SetEventList from './SetEventList';
import EventFormPage, { type SaveAction } from './EventFormPage';
import BannerImage from './BannerImage';
import EventOverview from './workspace/EventOverview';
import EventCollection from './workspace/EventCollection';
import EventQrLinks from './workspace/EventQrLinks';
import EventUsers from './workspace/EventUsers';
import CloudManagement from '../CloudManagement';
import Collections from '../Collections';
import UserManagement from '../UserManagement';
import RoleManagement, { RoleDetail } from '../RoleManagement';
import ActivityLog from '../ActivityLog';
import SystemSettings from '../SystemSettings';
import type { Role } from '../../data/mock';
import { setEventNavSections, type EventSectionId } from '../../data/navigation';
import { formatEventDateTime, setEventsSeed, withDetails, type SetEvent } from '../../data/setEvents';

type NavId = 'event-list' | 'banner-image' | 'cloud' | 'collections' | 'users' | 'roles' | 'activity' | 'settings';

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
  const [events, setEvents] = useState<SetEvent[]>(setEventsSeed);
  const [activeNav, setActiveNav] = useState<NavId>('event-list');
  const [view, setView] = useState<View>({ kind: 'list' });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SetEvent | null>(null);
  // Role opened from Role Management (its permission detail page).
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
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
    upsert(saved);
    // Submitting for review keeps the event open (now Pending) so it can be published next.
    setView(action === 'review' ? { kind: 'event', id: saved.id, section: 'detail', highlightPublish: true } : { kind: 'list' });
    const name = saved.name || 'Untitled';
    const messages: Partial<Record<SetEvent['status'], string>> = {
      Draft: `“${name}” saved as draft`,
      Pending: `“${name}” submitted for review — publish when ready`,
      Published: `“${name}” published`,
      Private: `“${name}” published privately`,
      Scheduled: `“${name}” scheduled for ${formatEventDateTime(saved.details?.scheduledAt ?? '')}`,
    };
    setToast(action === 'save' && saved.status !== 'Draft' ? `“${name}” updated` : (messages[saved.status] ?? `“${name}” updated`));
  };

  // Changes made directly in a workspace section (collection, QR links) apply immediately.
  const updateEvent = (id: number, patch: Parameters<typeof withDetails>[1], message: string) => {
    setEvents((list) => list.map((e) => (e.id === id ? withDetails(e, patch) : e)));
    setToast(message);
  };

  // Deleting from any tab moves the event to Trash; deleting from Trash is permanent.
  const handleConfirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
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
      setSelectedRole(null);
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
      case 'detail':
        return (
          <EventFormPage
            // Status in the key remounts the form after a save that keeps it open, so it reloads as the saved event.
            key={`${event.id}-${event.status}`}
            event={event}
            nextId={nextId}
            highlightPublish={highlightPublish}
            onDirtyChange={handleDirtyChange}
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

        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeNav === 'event-list' && (
            <>
              {/* Kept mounted so tabs, filters and page survive a trip into an event. */}
              <div hidden={view.kind !== 'list'}>
                <SetEventList
                  events={events}
                  onCreate={() => setView({ kind: 'create' })}
                  onOpen={(ev, section) => setView({ kind: 'event', id: ev.id, section })}
                  onDelete={setDeleting}
                />
              </div>
              {view.kind === 'create' && (
                <EventFormPage
                  key="new"
                  nextId={nextId}
                  onDirtyChange={handleDirtyChange}
                  onBack={() => setView({ kind: 'list' })}
                  onSave={handleSave}
                />
              )}
              {view.kind === 'event' && openEvent && renderWorkspace(openEvent, view.section, view.highlightPublish)}
            </>
          )}
          {activeNav === 'banner-image' && (
            <BannerImage
              events={events}
              onOpenEvent={(ev) => {
                setActiveNav('event-list');
                setView({ kind: 'event', id: ev.id, section: 'detail' });
              }}
            />
          )}
          {activeNav === 'cloud' && <CloudManagement />}
          {activeNav === 'collections' && <Collections />}
          {activeNav === 'users' && <UserManagement />}
          {activeNav === 'roles' &&
            (selectedRole ? (
              <RoleDetail role={selectedRole} onBack={() => setSelectedRole(null)} />
            ) : (
              <RoleManagement onSelectRole={setSelectedRole} />
            ))}
          {activeNav === 'activity' && <ActivityLog />}
          {activeNav === 'settings' && <SystemSettings />}
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
          title={deleting.status === 'Trash' ? 'Delete event permanently?' : 'Move event to Trash?'}
          confirmLabel={deleting.status === 'Trash' ? 'Delete Permanently' : 'Move to Trash'}
          message={
            deleting.status === 'Trash' ? (
              <>
                <span className="font-semibold text-[#1A1A1A]">{deleting.name}</span> ({deleting.id}) will be deleted
                permanently. This cannot be undone.
              </>
            ) : (
              <>
                <span className="font-semibold text-[#1A1A1A]">{deleting.name}</span> ({deleting.id}) will be moved to
                Trash. You can restore it later by editing it from the Trash tab.
              </>
            )
          }
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}

      {pendingNav && (
        <DeleteConfirmationModal
          title="Discard changes?"
          confirmLabel="Discard"
          message="Your unsaved changes to this event will be lost."
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
