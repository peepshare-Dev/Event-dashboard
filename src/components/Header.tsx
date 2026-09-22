import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-4 lg:px-6 gap-3 lg:gap-4 flex-shrink-0">
      {/* Mobile / tablet menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-8 h-8 -ml-1 rounded-lg hover:bg-[#F9FAFB] flex items-center justify-center transition-colors text-[#6B7280] hover:text-[#1A1A1A] flex-shrink-0"
        aria-label="Open menu"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-[#1A1A1A] leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-[#6B7280] truncate hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Language */}
        <button className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1A1A1A] transition-colors border border-[#E5E7EB] rounded-md px-2.5 py-1.5">
          <span>🌐</span>
          <span className="hidden sm:inline">EN</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="hidden sm:block">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg hover:bg-[#F9FAFB] flex items-center justify-center transition-colors text-[#6B7280] hover:text-[#1A1A1A]">
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF6115] rounded-full"></span>
        </button>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 hover:bg-[#F9FAFB] rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#FF6115] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">ST</span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-[#1A1A1A] leading-tight">@suchada.t</div>
              <div className="text-[10px] text-[#6B7280]">Super Admin</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-[#9CA3AF]">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 py-1.5 overflow-hidden">
                {[
                  { label: 'Profile Settings', icon: '👤' },
                  { label: 'Preferences', icon: '⚙️' },
                  { label: 'Sign Out', icon: '🚪' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition-colors text-left"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
