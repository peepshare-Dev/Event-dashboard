import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EventList from './views/EventList';
import EventDetail from './views/EventDetail';
import RegistrationData from './views/RegistrationData';
import SurveyFeedback from './views/SurveyFeedback';
import EventReports from './views/EventReports';
import PhotoManagement from './views/PhotoManagement';
import SyncActivity from './views/SyncActivity';
import UserManagement from './views/UserManagement';
import RoleManagement, { RoleDetail } from './views/RoleManagement';
import ActivityLog from './views/ActivityLog';
import SystemSettings from './views/SystemSettings';
import CloudManagement from './views/CloudManagement';
import Collections from './views/Collections';
import type { Event, Role } from './data/mock';

type NavId =
  | 'event-list'
  | 'registration'
  | 'survey'
  | 'reports'
  | 'cloud'
  | 'collections'
  | 'photos'
  | 'sync'
  | 'users'
  | 'roles'
  | 'activity'
  | 'settings';

const PAGE_TITLES: Record<NavId, { title: string; subtitle: string }> = {
  'event-list': { title: 'Event List', subtitle: 'Manage all PEEP SHARE events' },
  registration: { title: 'Registration Data', subtitle: 'View and export attendee data per event' },
  cloud: { title: 'Cloud Management', subtitle: 'Monitor storage usage and manage plans' },
  collections: { title: 'Collections', subtitle: 'Organize and share files in PEEP SHARE Cloud' },
  survey: { title: 'Survey & Feedback', subtitle: 'Analyze attendee satisfaction' },
  reports: { title: 'Event Reports', subtitle: 'Comprehensive event performance reports' },
  photos: { title: 'Photo Management', subtitle: 'Upload, sync, and manage event photos' },
  sync: { title: 'Sync Activity', subtitle: 'Photo upload and sync log' },
  users: { title: 'User Management', subtitle: 'Manage PEEP SHARE users and access' },
  roles: { title: 'Role Management', subtitle: 'Configure roles and permissions' },
  activity: { title: 'Activity Log', subtitle: 'System-wide audit trail' },
  settings: { title: 'System Settings', subtitle: 'Platform configuration' },
};

export default function App() {
  const [activeNav, setActiveNav] = useState<NavId>('event-list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavigate = (id: string) => {
    setActiveNav(id as NavId);
    setSelectedEvent(null);
    setSelectedRole(null);
  };

  const pageInfo = selectedEvent
    ? { title: selectedEvent.name, subtitle: `${selectedEvent.dates} · ${selectedEvent.location}` }
    : selectedRole
    ? { title: selectedRole.name, subtitle: 'Edit role permissions' }
    : PAGE_TITLES[activeNav] ?? { title: 'Dashboard', subtitle: '' };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar
        active={activeNav}
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Event Detail overrides nav */}
          {selectedEvent ? (
            <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
          ) : selectedRole ? (
            <RoleDetail role={selectedRole} onBack={() => setSelectedRole(null)} />
          ) : (
            <>
              {activeNav === 'event-list' && (
                <EventList onSelectEvent={(ev) => setSelectedEvent(ev)} />
              )}
              {activeNav === 'registration' && <RegistrationData />}
              {activeNav === 'survey' && <SurveyFeedback />}
              {activeNav === 'reports' && <EventReports />}
              {activeNav === 'cloud' && <CloudManagement />}
              {activeNav === 'collections' && <Collections />}
              {activeNav === 'photos' && <PhotoManagement />}
              {activeNav === 'sync' && <SyncActivity />}
              {activeNav === 'users' && <UserManagement />}
              {activeNav === 'roles' && (
                <RoleManagement onSelectRole={(role) => setSelectedRole(role)} />
              )}
              {activeNav === 'activity' && <ActivityLog />}
              {activeNav === 'settings' && <SystemSettings />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
