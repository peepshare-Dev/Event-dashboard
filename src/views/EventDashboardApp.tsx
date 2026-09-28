import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EventList from './EventList';
import EventDetail from './EventDetail';
import RegistrationData from './RegistrationData';
import SurveyFeedback from './SurveyFeedback';
import PhotoManagement from './PhotoManagement';
import SyncActivity from './SyncActivity';
import UserManagement from './UserManagement';
import RoleManagement, { RoleDetail } from './RoleManagement';
import ActivityLog from './ActivityLog';
import SystemSettings from './SystemSettings';
import CloudManagement from './CloudManagement';
import Collections from './Collections';
import type { Event, Role } from '../data/mock';

type NavId =
  | 'event-list'
  | 'registration'
  | 'survey'
  | 'cloud'
  | 'collections'
  | 'photos'
  | 'sync'
  | 'users'
  | 'roles'
  | 'activity'
  | 'settings';

interface EventDashboardAppProps {
  onSwitchService: () => void;
  onLogout: () => void;
}

export default function EventDashboardApp({ onSwitchService, onLogout }: EventDashboardAppProps) {
  const [activeNav, setActiveNav] = useState<NavId>('event-list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavigate = (id: string) => {
    setActiveNav(id as NavId);
    setSelectedEvent(null);
    setSelectedRole(null);
  };

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
          onMenuClick={() => setMobileNavOpen(true)}
          onSwitchService={onSwitchService}
          onLogout={onLogout}
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
