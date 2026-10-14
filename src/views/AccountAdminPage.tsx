import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BackToTop from '../components/ui/BackToTop';
import UserManagement from './UserManagement';
import RoleManagement, { RoleDetail } from './RoleManagement';
import { accountAdminNavSections } from '../data/navigation';
import type { Role } from '../data/mock';

type Tab = 'users' | 'roles';

interface AccountAdminPageProps {
  onBack: () => void;
  onLogout: () => void;
}

// User management (users + roles) lives at account level, outside every service (opened from the profile menu).
export default function AccountAdminPage({ onBack, onLogout }: AccountAdminPageProps) {
  const [tab, setTab] = useState<Tab>('users');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Role opened from the Roles menu (its permission detail page).
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  // Remounts the Users page so picking the menu again returns to the user list.
  const [usersKey, setUsersKey] = useState(0);

  const changeTab = (next: string) => {
    setSelectedRole(null);
    if (next === 'users') setUsersKey((k) => k + 1);
    setTab(next as Tab);
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar
        active={tab}
        onNavigate={changeTab}
        sections={accountAdminNavSections}
        logoTitle="PEEP SHARE"
        logoSubtitle="User Management"
        size="lg"
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          onUserManagement={() => changeTab('users')}
          onSwitchService={onBack}
          onLogout={onLogout}
        />

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:px-2 sm:py-2">
              {tab === 'users' && <UserManagement key={usersKey} />}
              {tab === 'roles' &&
                (selectedRole ? (
                  <RoleDetail role={selectedRole} onBack={() => setSelectedRole(null)} />
                ) : (
                  <RoleManagement onSelectRole={setSelectedRole} />
                ))}
            </div>
          </div>
          <BackToTop />
        </main>
      </div>
    </div>
  );
}
