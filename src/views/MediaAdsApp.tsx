import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BackToTop from '../components/ui/BackToTop';
import DeleteConfirmationModal from '../components/ui/DeleteConfirmationModal';
import PromoManager from './set-event/promo/PromoManager';
import { BANNER_PLACEMENT, COMMUNITY_BANNER_PLACEMENT, COVER_PLACEMENT } from './set-event/promo/placements';
import { mediaAdsNavSections } from '../data/navigation';
import { setEventsSeed } from '../data/setEvents';
import { useT } from '@/i18n';

type NavId = 'banner-home' | 'banner-community' | 'app-cover-pages';

const PLACEMENTS = {
  'banner-home': BANNER_PLACEMENT,
  'banner-community': COMMUNITY_BANNER_PLACEMENT,
  'app-cover-pages': COVER_PLACEMENT,
};

interface MediaAdsAppProps {
  onSwitchService: () => void;
  onLogout: () => void;
}

// Media Ads — in-app Banner and Cover Page (moved out of Set Event).
export default function MediaAdsApp({ onSwitchService, onLogout }: MediaAdsAppProps) {
  const [activeNav, setActiveNav] = useState<NavId>('banner-home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const t = useT();
  const [toast, setToast] = useState<string | null>(null);
  // Navigation waiting on "Discard changes?" while a promo form has unsaved edits.
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const formDirty = useRef(false);
  const handleDirtyChange = useCallback((dirty: boolean) => {
    formDirty.current = dirty;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleNavigate = (id: string) => {
    const go = () => setActiveNav(id as NavId);
    if (formDirty.current) setPendingNav(() => go);
    else go();
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar
        active={activeNav}
        onNavigate={handleNavigate}
        sections={mediaAdsNavSections}
        logoTitle="PEEP SHARE"
        logoSubtitle="Media Ads"
        size="lg"
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileNavOpen(true)} onSwitchService={onSwitchService} onLogout={onLogout} />

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
          <PromoManager
            // Key per menu, so switching screens starts fresh.
            key={activeNav}
            placement={PLACEMENTS[activeNav]}
            events={setEventsSeed}
            onToast={setToast}
            onDirtyChange={handleDirtyChange}
          />
          <BackToTop />
        </main>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] text-white text-sm rounded-xl shadow-lg max-w-[calc(100vw-32px)]"
        >
          <Icon icon="solar:check-circle-bold" width={18} height={18} className="text-[#22C55E] flex-shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}

      {pendingNav && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved changes will be lost.')}
          onConfirm={() => {
            formDirty.current = false;
            const go = pendingNav;
            setPendingNav(null);
            go();
          }}
          onClose={() => setPendingNav(null)}
        />
      )}
    </div>
  );
}
