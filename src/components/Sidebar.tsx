import { useState } from 'react';

// --- Icon components defined before navSections to avoid transform hoisting issues ---

function CalendarIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
    </svg>
  );
}
function ChartBarIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M9 19V6l12-3v13M9 19H3M21 19h-5.5" /><circle cx="3" cy="19" r="2" /><circle cx="21" cy="19" r="2" /><circle cx="9" cy="19" r="2" />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}
function CloudIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}
function PhotoIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
function SyncIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M4 4v5h5M20 20v-5h-5" /><path d="M20.49 9A9 9 0 005.64 5.64L4 4M3.51 15a9 9 0 0014.85 3.36L20 20" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

// --- Nav structure (defined after icons to guarantee availability) ---

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
      { id: 'event-list', label: 'Event List', icon: <CalendarIcon />, badge: 7 },
    ],
  },
  {
    title: 'DATA',
    items: [
      { id: 'registration', label: 'Registration Data', icon: <ClipboardIcon /> },
      { id: 'survey', label: 'Survey & Feedback', icon: <ChartBarIcon /> },
      { id: 'reports', label: 'Event Reports', icon: <DocumentIcon /> },
    ],
  },
  {
    title: 'CLOUD',
    items: [
      { id: 'cloud', label: 'Cloud Management', icon: <CloudIcon /> },
      { id: 'collections', label: 'Collections', icon: <FolderIcon /> },
    ],
  },
  {
    title: 'PHOTOS',
    items: [
      { id: 'photos', label: 'Photo Management', icon: <PhotoIcon /> },
      { id: 'sync', label: 'Sync Activity', icon: <SyncIcon /> },
    ],
  },
  {
    title: 'USERS & ACCESS',
    items: [
      { id: 'users', label: 'User Management', icon: <UsersIcon /> },
      { id: 'roles', label: 'Role Management', icon: <ShieldIcon /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'activity', label: 'Activity Log', icon: <ListIcon /> },
      { id: 'settings', label: 'System Settings', icon: <SettingsIcon /> },
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
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          )}
        </button>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-[#6B7280] hover:text-[#1A1A1A] flex-shrink-0 transition-colors"
          aria-label="Close menu"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
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
