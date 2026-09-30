import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { NavSection, EventSectionId } from '../../data/navigation';
import { eventWorkspaceSections } from '../../data/navigation';

interface EventWorkspaceSidebarProps {
  /** Service-level nav (Event List, Banner image, …) shown as the icon rail. */
  serviceSections: NavSection[];
  activeServiceNav: string;
  onServiceNavigate: (id: string) => void;
  section: EventSectionId;
  onSectionChange: (section: EventSectionId) => void;
  onBack: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// Sidebar shown while a saved event is open: a slim rail with the Set Event modules, plus a
// panel with the sections that belong to this one event.
export default function EventWorkspaceSidebar({
  serviceSections,
  activeServiceNav,
  onServiceNavigate,
  section,
  onSectionChange,
  onBack,
  mobileOpen,
  onMobileClose,
}: EventWorkspaceSidebarProps) {
  const [panelOpen, setPanelOpen] = useState(true);
  const railItems = serviceSections.flatMap((s) => s.items);

  const rail = (onToggle: () => void, toggleLabel: string, afterNavigate?: () => void) => (
    <div className="w-16 flex-shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col items-center py-4 gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={toggleLabel}
        className="w-10 h-10 mb-3 flex items-center justify-center rounded-lg text-[#374151] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
      >
        <Icon icon={toggleLabel === 'Close menu' ? 'solar:close-linear' : 'solar:hamburger-menu-linear'} width={22} height={22} />
      </button>
      <nav aria-label="Set Event" className="flex flex-col items-center gap-3">
        {railItems.map((item) => {
          const active = item.id === activeServiceNav;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onServiceNavigate(item.id);
                afterNavigate?.();
              }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              title={item.label}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
                active ? 'bg-[#FF6115] text-white' : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#1A1A1A]'
              }`}
            >
              {item.icon}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const panel = (afterNavigate?: () => void) => (
    <div className="w-[220px] flex-shrink-0 bg-[#F9FAFB] border-r border-[#E5E7EB] flex flex-col">
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="w-8 h-8 rounded-lg bg-[#FF6115] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">PS</span>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-[#1A1A1A] leading-tight">PEEP SHARE</div>
          <div className="text-xs text-[#6B7280]">Set Event</div>
        </div>
      </div>

      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={() => {
            onBack();
            afterNavigate?.();
          }}
          className="inline-flex items-center gap-1 h-8 text-xs font-medium text-[#1A1A1A] hover:text-[#FF6115] transition-colors"
        >
          <Icon icon="solar:alt-arrow-left-linear" width={14} height={14} />
          Back
        </button>
        <div className="mt-4 mb-2 text-xs text-[#6B7280]">Event management</div>
      </div>

      <nav aria-label="Event management" className="flex-1 overflow-y-auto px-3 space-y-2 pb-4">
        {eventWorkspaceSections.map((item) => {
          const active = item.id === section;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSectionChange(item.id);
                afterNavigate?.();
              }}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
                active ? 'bg-[#FFF0E8] text-[#FF6115] font-medium' : 'text-[#374151] hover:bg-white hover:text-[#1A1A1A]'
              }`}
            >
              <Icon icon={item.icon} width={22} height={22} className="flex-shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop (≥1024px) */}
      <aside className="hidden lg:flex h-screen flex-shrink-0">
        {rail(() => setPanelOpen(!panelOpen), panelOpen ? 'Collapse event menu' : 'Expand event menu')}
        {panelOpen && panel()}
      </aside>

      {/* Mobile / tablet drawer (<1024px) */}
      <div className={`lg:hidden fixed inset-0 z-40 ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onMobileClose}
        />
        <aside
          className={`absolute left-0 top-0 h-full max-w-[90vw] flex shadow-xl transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {rail(onMobileClose, 'Close menu', onMobileClose)}
          {panel(onMobileClose)}
        </aside>
      </div>
    </>
  );
}
