import { useState } from 'react';
import { Icon } from '@iconify/react';

// --- Nav structure ---

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: 'EVENT MANAGEMENT',
    items: [
      { id: 'event-list', label: 'Event List', icon: <Icon icon="solar:calendar-linear" width={16} height={16} />, badge: 7 },
    ],
  },
  {
    title: 'DATA',
    items: [
      { id: 'registration', label: 'Registration Data', icon: <Icon icon="solar:clipboard-list-linear" width={16} height={16} /> },
      { id: 'survey', label: 'Survey & Feedback', icon: <Icon icon="solar:chart-2-linear" width={16} height={16} /> },
    ],
  },
  {
    title: 'CLOUD',
    items: [
      { id: 'cloud', label: 'Cloud Management', icon: <Icon icon="solar:cloud-linear" width={16} height={16} /> },
      { id: 'collections', label: 'Collections', icon: <Icon icon="solar:folder-linear" width={16} height={16} /> },
    ],
  },
  {
    title: 'PHOTOS',
    items: [
      { id: 'photos', label: 'Photo Management', icon: <Icon icon="solar:gallery-linear" width={16} height={16} /> },
      { id: 'sync', label: 'Sync Activity', icon: <Icon icon="solar:refresh-circle-linear" width={16} height={16} /> },
    ],
  },
  {
    title: 'USERS & ACCESS',
    items: [
      { id: 'users', label: 'User Management', icon: <Icon icon="solar:users-group-rounded-linear" width={16} height={16} /> },
      { id: 'roles', label: 'Role Management', icon: <Icon icon="solar:shield-linear" width={16} height={16} /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'activity', label: 'Activity Log', icon: <Icon icon="solar:history-linear" width={16} height={16} /> },
      { id: 'settings', label: 'System Settings', icon: <Icon icon="solar:settings-linear" width={16} height={16} /> },
    ],
  },
];

// --- Component ---

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarLogo({ collapsed, onToggleCollapse, onClose }: { collapsed: boolean; onToggleCollapse?: () => void; onClose?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-5 border-b border-[#E5E7EB]">
      <div className="w-8 h-8 rounded-lg bg-[#FF6115] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">PS</span>
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="font-bold text-sm text-[#1A1A1A] leading-tight">PEEP SHARE</div>
          <div className="text-xs text-[#6B7280]">Event Dashboard</div>
        </div>
      )}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="ml-auto text-[#6B7280] hover:text-[#1A1A1A] flex-shrink-0 transition-colors"
        >
          {collapsed ? (
            <Icon icon="solar:alt-arrow-right-linear" width={16} height={16} />
          ) : (
            <Icon icon="solar:alt-arrow-left-linear" width={16} height={16} />
          )}
        </button>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-[#6B7280] hover:text-[#1A1A1A] flex-shrink-0 transition-colors"
          aria-label="Close menu"
        >
          <Icon icon="solar:close-linear" width={18} height={18} />
        </button>
      )}
    </div>
  );
}

function SidebarNav({ active, collapsed, onItemClick }: { active: string; collapsed: boolean; onItemClick: (id: string) => void }) {
  return (
    <nav className="flex-1 overflow-y-auto py-3">
      {navSections.map((section) => (
        <div key={section.title} className="mb-1">
          {!collapsed && (
            <div className="px-5 pt-4 pb-1 text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase">
              {section.title}
            </div>
          )}
          {section.items.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-4 mx-2 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${collapsed ? 'justify-center' : ''} ${
                  isActive
                    ? 'bg-[#FFF0E8] text-[#FF6115] font-medium'
                    : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#1A1A1A]'
                }`}
                style={{ width: collapsed ? 48 : 'calc(100% - 16px)' }}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-[#FF6115]' : 'text-[#9CA3AF]'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-semibold bg-[#FF6115] text-white rounded-full px-1.5 py-0.5 leading-none">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarUser({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div className="border-t border-[#E5E7EB] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#FF6115] flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-white">ST</span>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-[#1A1A1A] truncate">@suchada.t</div>
          <div className="text-[10px] text-[#6B7280]">Super Admin</div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ active, onNavigate, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop / tablet-large sidebar (>=1024px) */}
      <aside
        className="hidden lg:flex flex-col h-screen bg-white border-r border-[#E5E7EB] transition-all duration-200 flex-shrink-0"
        style={{ width: collapsed ? 64 : 272 }}
      >
        <SidebarLogo collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <SidebarNav active={active} collapsed={collapsed} onItemClick={onNavigate} />
        <SidebarUser collapsed={collapsed} />
      </aside>

      {/* Mobile / tablet drawer (<1024px) */}
      <div className={`lg:hidden fixed inset-0 z-40 ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onMobileClose}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white border-r border-[#E5E7EB] flex flex-col shadow-xl transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarLogo collapsed={false} onClose={onMobileClose} />
          <SidebarNav
            active={active}
            collapsed={false}
            onItemClick={(id) => {
              onNavigate(id);
              onMobileClose?.();
            }}
          />
          <SidebarUser collapsed={false} />
        </aside>
      </div>
    </>
  );
}
