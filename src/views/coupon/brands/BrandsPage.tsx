import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import StatusTabs from '../../../components/ui/StatusTabs';
import Button from '../../../components/ui/Button';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import { comparePartnerLogos, type Brand, type Coupon, type CouponUser, type Phase } from '../../../data/coupons';
import { couponApi } from '../../../data/mock/couponApi';
import type { ToastAction } from '../CouponApp';
import { useCan } from '../CouponRoleContext';
import BrandList from './BrandList';
import BrandDetail, { type BrandTab } from './BrandDetail';
import AddBrandModal from './AddBrandModal';
import PartnerLogosTab from './PartnerLogosTab';
import { useT } from '@/i18n';

const LIST_TABS = ['All partners', 'Logo order'] as const;
type ListTab = (typeof LIST_TABS)[number];

type Screen = { kind: 'list'; tab: ListTab } | { kind: 'detail'; id: string; tab: BrandTab };

interface BrandsPageProps {
  onToast: (message: string, action?: ToastAction) => void;
  /** Lets the app guard navigation away from unsaved brand edits. */
  onDirtyChange: (dirty: boolean) => void;
  /** Open this brand straight away (e.g. from the coupon form or Display). */
  initialBrandId?: string;
  onOpenCoupon: (couponId: string) => void;
  /** Coupon list, new coupon form with this brand selected. */
  onCreateCoupon: (brandId: string) => void;
}

// "Partners" (brands in the data model): All partners ⇄ partner page, plus the app's logo order.
// The only place partner details are edited.
export default function BrandsPage({ onToast, onDirtyChange, initialBrandId, onOpenCoupon, onCreateCoupon }: BrandsPageProps) {
  const t = useT();
  const canAdd = useCan('brand.write');
  const [screen, setScreen] = useState<Screen>(initialBrandId ? { kind: 'detail', id: initialBrandId, tab: 'overview' } : { kind: 'list', tab: 'All partners' });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [bdUsers, setBdUsers] = useState<CouponUser[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [adding, setAdding] = useState(false);
  // Unsaved logo order, guarded before leaving the list (the tab stays mounted while switching tabs).
  const logosDirty = useRef(false);
  const [pendingGo, setPendingGo] = useState<Screen | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackLogosDirty = useCallback(
    (d: boolean) => {
      logosDirty.current = d;
      onDirtyChange(d);
    },
    [onDirtyChange],
  );
  const byLogoOrder = useMemo(() => [...brands].sort(comparePartnerLogos), [brands]);

  const load = useCallback(() => {
    setLoadState('loading');
    Promise.all([couponApi.brands.list(), couponApi.coupons.list(), couponApi.phases.list(), couponApi.users.listBd()])
      .then(([b, c, p, u]) => {
        setBrands(b);
        setCoupons(c);
        setPhases(p);
        setBdUsers(u);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, []);
  useEffect(load, [load]);

  const go = (next: Screen) => {
    setScreen(next);
    rootRef.current?.closest('main')?.scrollTo(0, 0);
  };
  const openDetail = (id: string) => {
    const next: Screen = { kind: 'detail', id, tab: 'overview' };
    if (logosDirty.current) setPendingGo(next);
    else go(next);
  };

  const saveBrand = (brand: Brand) => setBrands((list) => (list.some((b) => b.id === brand.id) ? list.map((b) => (b.id === brand.id ? brand : b)) : [...list, brand]));
  const current = screen.kind === 'detail' ? brands.find((b) => b.id === screen.id) : undefined;

  // A brand that no longer exists falls back to the list.
  useEffect(() => {
    if (loadState === 'ready' && screen.kind === 'detail' && !current) setScreen({ kind: 'list', tab: 'All partners' });
  }, [loadState, screen, current]);

  return (
    <div ref={rootRef}>
      {screen.kind === 'detail' && current ? (
        <BrandDetail
          brand={current}
          coupons={coupons}
          setCoupons={setCoupons}
          phases={phases}
          bdUsers={bdUsers}
          tab={screen.tab}
          onTabChange={(tab) => setScreen({ ...screen, tab })}
          onBack={() => go({ kind: 'list', tab: 'All partners' })}
          onSaved={saveBrand}
          onOpenCoupon={onOpenCoupon}
          onCreateCoupon={() => onCreateCoupon(current.id)}
          onDirtyChange={onDirtyChange}
          onToast={onToast}
        />
      ) : screen.kind === 'detail' && loadState !== 'error' ? (
        <div role="status" aria-label={t('Loading partners')} className="p-8">
          <div className="h-40 rounded-2xl bg-white border border-[#E5E7EB] animate-pulse" />
        </div>
      ) : (
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
            <PageHeader
              title={t('Partners')}
              icon="solar:shop-linear"
              description={t('Partner restaurants: contract, contacts, coupons, notes, and the order of their logos in the app.')}
              actions={
                canAdd && (
                  <Button pill icon="solar:add-linear" onClick={() => setAdding(true)} className="whitespace-nowrap flex-1 sm:flex-none">
                    {t('Add partner')}
                  </Button>
                )
              }
            />
            {screen.kind === 'list' && (
              <StatusTabs
                tabs={LIST_TABS}
                active={screen.tab}
                counts={{ 'All partners': brands.length }}
                onChange={(tab) => setScreen({ kind: 'list', tab })}
                className="mt-5"
              />
            )}
            {/* Both stay mounted so an unsaved logo order survives switching tabs. */}
            <div className="mt-5" hidden={screen.kind === 'list' && screen.tab !== 'All partners'}>
              <BrandList brands={brands} coupons={coupons} phases={phases} bdUsers={bdUsers} loadState={loadState} onRetry={load} onAdd={() => setAdding(true)} onOpen={(b) => openDetail(b.id)} />
            </div>
            {loadState === 'ready' && (
              <div className="mt-5" hidden={screen.kind !== 'list' || screen.tab !== 'Logo order'}>
                <PartnerLogosTab brands={byLogoOrder} onBrandsChange={setBrands} coupons={coupons} phases={phases} onToast={onToast} onDirtyChange={trackLogosDirty} onOpenBrand={openDetail} />
              </div>
            )}
          </div>
        </div>
      )}

      {pendingGo && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved logo order will be lost.')}
          onConfirm={() => {
            trackLogosDirty(false);
            go(pendingGo);
            setPendingGo(null);
          }}
          onClose={() => setPendingGo(null)}
        />
      )}

      {adding && (
        <AddBrandModal
          brands={brands}
          onClose={() => setAdding(false)}
          onCreated={(created) => {
            saveBrand(created);
            setAdding(false);
            onToast(t('“{name}” added. Fill in its partner period and contacts.', { name: created.name }));
            openDetail(created.id);
          }}
        />
      )}
    </div>
  );
}
