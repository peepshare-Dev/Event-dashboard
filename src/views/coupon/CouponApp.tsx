import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import BackToTop from '../../components/ui/BackToTop';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import { couponNavSections } from '../../data/navigation';
import { COUPON_ROLE_LABELS, type CouponRole } from '../../data/coupons';
import { CouponRoleProvider, useCouponUser } from './CouponRoleContext';
import CouponManager from './coupons/CouponManager';
import DisplayPage from './display/DisplayPage';
import PhasesPage from './phases/PhasesPage';
import BrandsPage from './brands/BrandsPage';
import { initials } from './format';
import { useT } from '@/i18n';

type NavId = 'coupon-dashboard' | 'coupon-brands' | 'coupon-list' | 'coupon-phases' | 'coupon-display';

// Loaded on demand: the chart library is only needed here.
const DashboardPage = lazy(() => import('./dashboard/DashboardPage'));

const ROLE_OPTIONS = (Object.keys(COUPON_ROLE_LABELS) as CouponRole[]).map((value) => ({ value, label: COUPON_ROLE_LABELS[value] }));

/** Coupon list entry point: open a coupon, or a new coupon (optionally for a brand). */
type ListTarget = { couponId?: string; newForBrand?: string };

/** A button in the toast, e.g. Undo. */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface CouponAppProps {
  onSwitchService: () => void;
  onLogout: () => void;
}

// Coupon — partner restaurant coupon campaign (Admin manages; BD views and keeps partner notes / documents).
export default function CouponApp(props: CouponAppProps) {
  return (
    <CouponRoleProvider>
      <CouponShell {...props} />
    </CouponRoleProvider>
  );
}

function CouponShell({ onSwitchService, onLogout }: CouponAppProps) {
  const t = useT();
  const { user, setRole } = useCouponUser();
  const [activeNav, setActiveNav] = useState<NavId>('coupon-dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Bumped on every menu click, so clicking the current page's menu item takes it back to its first screen.
  const [navCount, setNavCount] = useState(0);
  // What to open when another page sends the admin to the Coupon list.
  const [listTarget, setListTarget] = useState<ListTarget | null>(null);
  // Brand to open when another page links to the Brands menu.
  const [brandTarget, setBrandTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; action?: ToastAction; key: number } | null>(null);
  // Navigation waiting on "Discard changes?" while a form has unsaved edits.
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const formDirty = useRef(false);
  const handleDirtyChange = useCallback((dirty: boolean) => {
    formDirty.current = dirty;
  }, []);
  const openCouponList = (target: ListTarget | null) => {
    setListTarget(target);
    setActiveNav('coupon-list');
  };
  const openBrand = (brandId: string) =>
    guard(() => {
      setBrandTarget(brandId);
      setActiveNav('coupon-brands');
    });

  const showToast = useCallback((message: string, action?: ToastAction) => setToast({ message, action, key: Date.now() }), []);

  useEffect(() => {
    if (!toast) return;
    // Longer when there's something to undo.
    const timer = setTimeout(() => setToast(null), toast.action ? 6000 : 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const guard = (go: () => void) => (formDirty.current ? setPendingNav(() => go) : go());

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar
        active={activeNav}
        onNavigate={(id) =>
          guard(() => {
            setActiveNav(id as NavId);
            setListTarget(null);
            setBrandTarget(null);
            setNavCount((n) => n + 1);
          })
        }
        sections={couponNavSections}
        logoTitle="PEEP SHARE"
        logoSubtitle="Coupon"
        userInitials={initials(user.name)}
        userName={user.name}
        userRoleLabel={COUPON_ROLE_LABELS[user.role]}
        size="lg"
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          onSwitchService={() => guard(onSwitchService)}
          onLogout={() => guard(onLogout)}
          userName={user.name}
          userRoleLabel={COUPON_ROLE_LABELS[user.role]}
          userInitials={initials(user.name)}
          // Dev only, until real auth decides the role.
          roleSwitcher={import.meta.env.DEV ? { role: user.role, options: ROLE_OPTIONS, onChange: (r) => guard(() => setRole(r as CouponRole)) } : undefined}
        />

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
          {activeNav === 'coupon-dashboard' ? (
            <Suspense fallback={<div role="status" aria-label={t('Loading')} className="p-8" />}>
              <DashboardPage onOpenCoupon={(id) => openCouponList(id ? { couponId: id } : null)} />
            </Suspense>
          ) : activeNav === 'coupon-brands' ? (
            <BrandsPage
              key={`${user.role}-${brandTarget ?? ''}-${navCount}`}
              initialBrandId={brandTarget ?? undefined}
              onToast={showToast}
              onDirtyChange={handleDirtyChange}
              onOpenCoupon={(couponId) => guard(() => openCouponList({ couponId }))}
              onCreateCoupon={(brandId) => guard(() => openCouponList({ newForBrand: brandId }))}
            />
          ) : activeNav === 'coupon-list' ? (
            // Re-mounted per role so a form opened as Admin doesn't stay editable after switching to BD.
            <CouponManager
              key={`${user.role}-${listTarget?.couponId ?? ''}-${listTarget?.newForBrand ?? ''}-${navCount}`}
              initialCouponId={listTarget?.couponId}
              initialCreateBrandId={listTarget?.newForBrand}
              onOpenBrand={openBrand}
              onToast={showToast}
              onDirtyChange={handleDirtyChange}
            />
          ) : activeNav === 'coupon-display' ? (
            <DisplayPage key={`${user.role}-${navCount}`} onToast={showToast} onDirtyChange={handleDirtyChange} />
          ) : (
            <PhasesPage
              key={`${user.role}-${navCount}`}
              onToast={showToast}
              onDirtyChange={handleDirtyChange}
              onOpenCoupon={(couponId) => openCouponList({ couponId })}
            />
          )}
          <BackToTop />
        </main>
      </div>

      {toast && (
        <div
          key={toast.key}
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 pl-4 pr-2 py-2 min-h-12 bg-[#1A1A1A] text-white text-sm rounded-xl shadow-lg max-w-[calc(100vw-32px)]"
        >
          <Icon icon="solar:check-circle-bold" width={18} height={18} className="text-[#22C55E] flex-shrink-0" />
          <span className="min-w-0">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action!.onClick();
                setToast(null);
              }}
              className="flex-shrink-0 h-8 px-3 rounded-lg font-semibold text-[#FF6115] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {toast.action.label}
            </button>
          )}
          {!toast.action && <span className="w-2" aria-hidden="true" />}
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
