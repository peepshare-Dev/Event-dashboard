import { Suspense, lazy, useCallback, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import StatusTabs from '../../../components/ui/StatusTabs';
import Button from '../../../components/ui/Button';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import { brandPartnerStatus, type Brand, type Coupon, type CouponUser, type Phase } from '../../../data/coupons';
import type { ToastAction } from '../CouponApp';
import { useCan } from '../CouponRoleContext';
import BrandPartnerBadge from './BrandPartnerBadge';
import BrandOverview from './BrandOverview';
import BrandCoupons from './BrandCoupons';
import BrandSettings from './BrandSettings';
import BrandNotesPanel from './BrandNotesPanel';
import { usePartnerPeriod } from './BrandList';
import { exportPartnerCoupons } from './partnerExport';
import { useT } from '@/i18n';

// Loaded on demand: the chart library is only needed there.
const BrandUsage = lazy(() => import('./BrandUsage'));

export type BrandTab = 'overview' | 'usage' | 'coupons' | 'settings' | 'notes';
const TAB_LABELS: Record<BrandTab, string> = { overview: 'Overview', usage: 'Usage data', coupons: 'Coupons', settings: 'Settings', notes: 'Notes and documents' };

interface BrandDetailProps {
  brand: Brand;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  phases: Phase[];
  bdUsers: CouponUser[];
  tab: BrandTab;
  onTabChange: (tab: BrandTab) => void;
  onBack: () => void;
  onSaved: (brand: Brand) => void;
  onOpenCoupon: (id: string) => void;
  onCreateCoupon: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onToast: (message: string, action?: ToastAction) => void;
}

// One partner: header (with its CSV export) plus Overview, Coupons, Settings (Admin) and Notes and documents.
export default function BrandDetail(props: BrandDetailProps) {
  const { brand, coupons, setCoupons, phases, bdUsers, tab, onTabChange, onBack, onSaved, onOpenCoupon, onCreateCoupon, onDirtyChange, onToast } = props;
  const t = useT();
  const period = usePartnerPeriod();
  const canEditBrand = useCan('brand.write');
  const tabs: BrandTab[] = canEditBrand ? ['overview', 'usage', 'coupons', 'settings', 'notes'] : ['overview', 'usage', 'coupons', 'notes'];
  const current = tabs.includes(tab) ? tab : 'overview';
  const own = coupons.filter((c) => c.brandId === brand.id);
  const owner = bdUsers.find((u) => u.id === brand.ownerBdId);

  // Unsaved edits on a tab survive a tab switch only after "Discard?".
  const dirty = useRef(false);
  const [pendingTab, setPendingTab] = useState<BrandTab | null>(null);
  const trackDirty = useCallback(
    (d: boolean) => {
      dirty.current = d;
      onDirtyChange(d);
    },
    [onDirtyChange],
  );
  const pick = (next: BrandTab) => (dirty.current && next !== current ? setPendingTab(next) : onTabChange(next));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 h-8 -ml-1 px-1 text-sm text-[#6B7280] rounded-md hover:text-[#FF6115] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
      >
        <Icon icon="solar:arrow-left-linear" width={16} height={16} />
        {t('Back to {page}', { page: t('Partners') })}
      </button>

      <header className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img src={brand.logoUrl} alt="" className="hidden sm:block w-14 h-14 rounded-full object-cover border border-[#E5E7EB] flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-[#1A1A1A] leading-tight break-words">{brand.name}</h1>
              <BrandPartnerBadge status={brandPartnerStatus(brand)} />
            </div>
            <p className="mt-1 text-sm text-[#6B7280]">
              {t('Partner period')}: {period(brand)} · {t('Owner BD')}: {owner?.name ?? '—'}
            </p>
          </div>
          <Button
            variant="secondary"
            pill
            icon="solar:download-minimalistic-linear"
            onClick={() => exportPartnerCoupons(brand, coupons, phases)}
            disabled={!own.length}
            title={own.length ? t('One row per coupon: views, viewers, claims, redemptions and stock, all time.') : undefined}
            className="whitespace-nowrap self-start sm:self-auto"
          >
            {t('Export partner data')}
          </Button>
        </div>
        <StatusTabs
          tabs={tabs.map((k) => TAB_LABELS[k])}
          active={TAB_LABELS[current]}
          counts={{ [TAB_LABELS.coupons]: own.length }}
          onChange={(label) => pick(tabs.find((k) => TAB_LABELS[k] === label) ?? 'overview')}
          className="mt-5"
        />
      </header>

      {current === 'overview' && <BrandOverview brand={brand} coupons={own} phases={phases} bdUsers={bdUsers} onSaved={onSaved} onDirtyChange={trackDirty} onToast={onToast} />}
      {current === 'usage' && (
        <Suspense fallback={<div role="status" aria-label={t('Loading')} className="h-64 rounded-2xl bg-white border border-[#E5E7EB] animate-pulse" />}>
          <BrandUsage brand={brand} coupons={own} phases={phases} />
        </Suspense>
      )}
      {current === 'coupons' && (
        <BrandCoupons brand={brand} coupons={coupons} setCoupons={setCoupons} phases={phases} onOpenCoupon={onOpenCoupon} onCreateCoupon={onCreateCoupon} onToast={onToast} />
      )}
      {current === 'settings' && <BrandSettings brand={brand} onSaved={onSaved} onDirtyChange={trackDirty} onToast={onToast} />}
      {current === 'notes' && (
        <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <BrandNotesPanel brandId={brand.id} onToast={onToast} />
        </section>
      )}

      {pendingTab && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved changes will be lost.')}
          onConfirm={() => {
            trackDirty(false);
            onTabChange(pendingTab);
            setPendingTab(null);
          }}
          onClose={() => setPendingTab(null)}
        />
      )}
    </div>
  );
}
