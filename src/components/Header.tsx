import { useState } from 'react';
import { Icon } from '@iconify/react';
import { LANGUAGES, useLanguage, useT } from '@/i18n';

export interface RoleSwitcherOption {
  value: string;
  label: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
  showLogo?: boolean;
  onProfileClick?: () => void;
  onSwitchService?: () => void;
  onUserManagement?: () => void;
  onLogout?: () => void;
  userName?: string;
  userRoleLabel?: string;
  roleSwitcher?: {
    role: string;
    options: RoleSwitcherOption[];
    onChange: (role: string) => void;
  };
}

export default function Header({
  onMenuClick,
  showLogo,
  onProfileClick,
  onSwitchService,
  onUserManagement,
  onLogout,
  userName = '@suchada.t',
  userRoleLabel = 'Super Admin',
  roleSwitcher,
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const { lang, setLang } = useLanguage();
  const t = useT();

  const menuItems = [
    { label: 'User Profile', icon: 'solar:user-linear', onClick: onProfileClick },
    ...(onUserManagement ? [{ label: 'User management', icon: 'solar:users-group-rounded-linear', onClick: onUserManagement }] : []),
    { label: 'Switch Service', icon: 'solar:refresh-circle-linear', onClick: onSwitchService },
    { label: 'Log Out', icon: 'solar:logout-2-linear', onClick: onLogout },
  ];

  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-4 lg:px-6 gap-3 lg:gap-4 flex-shrink-0">
      {showLogo && (
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#FF6115] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">PS</span>
          </div>
          <span className="font-bold text-sm text-[#1A1A1A] hidden sm:inline truncate">PEEP SHARE</span>
        </div>
      )}

      {/* Mobile / tablet menu button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 -ml-1 rounded-lg hover:bg-[#F9FAFB] flex items-center justify-center transition-colors text-[#6B7280] hover:text-[#1A1A1A] flex-shrink-0"
          aria-label={t('Open menu')}
        >
          <Icon icon="solar:hamburger-menu-linear" width={18} height={18} />
        </button>
      )}

      <div className="flex items-center gap-2 lg:gap-3 ml-auto">
        {/* Role switcher (preview) */}
        {roleSwitcher && (
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1A1A1A] transition-colors border border-[#E5E7EB] rounded-md px-2.5 py-1.5"
            >
              <Icon icon="solar:users-group-rounded-linear" width={14} height={14} />
              <span className="hidden sm:inline">
                {t(roleSwitcher.options.find((o) => o.value === roleSwitcher.role)?.label ?? roleSwitcher.role)}
              </span>
              <Icon icon="solar:alt-arrow-down-linear" width={12} height={12} />
            </button>

            {showRoleDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRoleDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 py-1.5 overflow-hidden">
                  <div className="px-4 py-1.5 text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase">
                    {t('Preview as')}
                  </div>
                  {roleSwitcher.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setShowRoleDropdown(false);
                        roleSwitcher.onChange(option.value);
                      }}
                      className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors ${
                        option.value === roleSwitcher.role
                          ? 'text-[#FF6115] bg-[#FFF0E8] font-medium'
                          : 'text-[#4B5563] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      {t(option.label)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Language */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            aria-haspopup="listbox"
            aria-expanded={showLangDropdown}
            aria-label={t('Language')}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1A1A1A] transition-colors border border-[#E5E7EB] rounded-md px-2.5 py-1.5"
          >
            <Icon icon="solar:globe-linear" width={14} height={14} />
            <span>{LANGUAGES.find((l) => l.value === lang)?.short}</span>
            <Icon icon="solar:alt-arrow-down-linear" width={12} height={12} className="hidden sm:block" />
          </button>
          {showLangDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLangDropdown(false)} />
              <ul role="listbox" aria-label={t('Language')} className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 py-1.5">
                {LANGUAGES.map((l) => (
                  <li key={l.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={l.value === lang}
                      onClick={() => {
                        setLang(l.value);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left transition-colors ${
                        l.value === lang ? 'text-[#FF6115] bg-[#FFF0E8] font-medium' : 'text-[#4B5563] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      {l.label}
                      <span className="text-xs text-[#9CA3AF]">{l.short}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

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
              <div className="text-xs font-semibold text-[#1A1A1A] leading-tight">{userName}</div>
              <div className="text-[10px] text-[#6B7280]">{t(userRoleLabel)}</div>
            </div>
            <Icon icon="solar:alt-arrow-down-linear" width={12} height={12} className="text-[#9CA3AF]" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 py-1.5 overflow-hidden">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setShowDropdown(false);
                      item.onClick?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition-colors text-left"
                  >
                    <Icon icon={item.icon} width={15} height={15} className="text-[#9CA3AF]" />
                    {t(item.label)}
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
