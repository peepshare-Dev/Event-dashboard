import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EventList from './EventList';
import EventDetail from './EventDetail';
import CloudManagement from './CloudManagement';
import Collections from './Collections';
import PhotoManagement from './PhotoManagement';
import { peepSyncNavSections } from '../data/navigation';
import type { Event } from '../data/mock';

type NavId = 'event-list' | 'cloud' | 'collections' | 'photo-sync';

interface PeepSyncAppProps {
  onSwitchService: () => void;
  onLogout: () => void;
}

export default function PeepSyncApp({ onSwitchService, onLogout }: PeepSyncAppProps) {
  const [activeNav, setActiveNav] = useState<NavId>('event-list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavigate = (id: string) => {
    setActiveNav(id as NavId);
    setSelectedEvent(null);
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar
        active={activeNav}
        onNavigate={handleNavigate}
        sections={peepSyncNavSections}
        logoInitials="PS"
        logoTitle="PEEP SYNC"
        logoSubtitle="Photographer Workspace"
        userRoleLabel="Photographer"
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          onSwitchService={onSwitchService}
          onLogout={onLogout}
          userRoleLabel="Photographer"
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {selectedEvent ? (
            <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
          ) : (
            <>
              {activeNav === 'event-list' && (
                <EventList onSelectEvent={(ev) => setSelectedEvent(ev)} />
              )}
              {activeNav === 'cloud' && <CloudManagement />}
              {activeNav === 'collections' && <Collections />}
              {activeNav === 'photo-sync' && <PhotoManagement />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
