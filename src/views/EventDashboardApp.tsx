import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EventList from './EventList';
import EventDetail from './EventDetail';
import RegistrationData from './RegistrationData';
import SurveyFeedback from './SurveyFeedback';
import PhotoManagement from './PhotoManagement';
import SyncActivity from './SyncActivity';
import CloudManagement from './CloudManagement';
import Collections from './Collections';
import { adminNavSections, dataViewerNavSections, type DashboardRole } from '../data/navigation';
import type { Event } from '../data/mock';

const DATA_VIEWER_TABS = ['Registration', 'Survey'] as const;

type NavId =
  | 'event-list'
  | 'registration'
  | 'survey'
  | 'cloud'
  | 'collections'
  | 'photos'
  | 'sync';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Super Admin' },
  { value: 'data-viewer', label: 'Data Viewer' },
];

const ROLE_LABELS: Record<DashboardRole, string> = {
  admin: 'Super Admin',
  'data-viewer': 'Data Viewer',
};

interface EventDashboardAppProps {
  onSwitchService: () => void;
  onLogout: () => void;
}

export default function EventDashboardApp({ onSwitchService, onLogout }: EventDashboardAppProps) {
  const [role, setRole] = useState<DashboardRole>('admin');
  const [activeNav, setActiveNav] = useState<NavId>('event-list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navSections = role === 'admin' ? adminNavSections : dataViewerNavSections;

  const handleNavigate = (id: string) => {
    setActiveNav(id as NavId);
    setSelectedEvent(null);
  };

  const handleRoleChange = (nextRole: string) => {
    const parsedRole = nextRole as DashboardRole;
    setRole(parsedRole);
    setSelectedEvent(null);
    setActiveNav('event-list');
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar
        active={activeNav}
        onNavigate={handleNavigate}
        sections={navSections}
        userRoleLabel={ROLE_LABELS[role]}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          onSwitchService={onSwitchService}
          onLogout={onLogout}
          userRoleLabel={ROLE_LABELS[role]}
          roleSwitcher={{ role, options: ROLE_OPTIONS, onChange: handleRoleChange }}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Event Detail overrides nav */}
          {selectedEvent ? (
            <EventDetail
              event={selectedEvent}
              onBack={() => setSelectedEvent(null)}
              visibleTabs={role === 'data-viewer' ? DATA_VIEWER_TABS : undefined}
            />
          ) : (
            <>
              {activeNav === 'event-list' && <EventList onSelectEvent={(ev) => setSelectedEvent(ev)} />}
              {activeNav === 'registration' && <RegistrationData />}
              {activeNav === 'survey' && <SurveyFeedback />}
              {activeNav === 'cloud' && <CloudManagement />}
              {activeNav === 'collections' && <Collections />}
              {activeNav === 'photos' && <PhotoManagement />}
              {activeNav === 'sync' && <SyncActivity />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
