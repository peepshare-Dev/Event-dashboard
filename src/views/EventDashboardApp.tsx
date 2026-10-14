import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BackToTop from '../components/ui/BackToTop';
import EventList from './EventList';
import EventDetail from './EventDetail';
import { eventDashboardNavSections } from '../data/navigation';
import type { Event } from '../data/mock';

// Data Viewers see registration and survey data inside each event.
const EVENT_TABS = ['Registration', 'Survey'] as const;
const ROLE_LABEL = 'Data Viewer';

interface EventDashboardAppProps {
  onSwitchService: () => void;
  onLogout: () => void;
}

// Event Dashboard is for Data Viewers only: the Event List, then each event's data.
export default function EventDashboardApp({ onSwitchService, onLogout }: EventDashboardAppProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar
        active="event-list"
        onNavigate={() => setSelectedEvent(null)}
        sections={eventDashboardNavSections}
        userRoleLabel={ROLE_LABEL}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          onSwitchService={onSwitchService}
          onLogout={onLogout}
          userRoleLabel={ROLE_LABEL}
        />

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
          {selectedEvent ? (
            <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} visibleTabs={EVENT_TABS} />
          ) : (
            <EventList dashboard onSelectEvent={(ev) => setSelectedEvent(ev)} />
          )}
          <BackToTop />
        </main>
      </div>
    </div>
  );
}
