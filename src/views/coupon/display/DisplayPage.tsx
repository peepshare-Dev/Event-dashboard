import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import { comparePartnerLogos, partnerLogoStatus, type Banner, type Coupon, type Phase, type Brand } from '../../../data/coupons';
import { couponApi } from '../../../data/mock/couponApi';
import type { ToastAction } from '../CouponApp';
import { useCan } from '../CouponRoleContext';
import BannersTab from './BannersTab';
import { useT } from '@/i18n';

interface DisplayPageProps {
  onToast: (message: string, action?: ToastAction) => void;
  /** Lets the app guard navigation away from an unsaved order. */
  onDirtyChange: (dirty: boolean) => void;
}

// "Display": the banner carousel on the app's Coupon landing screen. Partner logo order is on the Partners page.
export default function DisplayPage({ onToast, onDirtyChange }: DisplayPageProps) {
  const t = useT();
  const canEdit = useCan('banner.write');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(() => {
    setLoadState('loading');
    Promise.all([couponApi.banners.list(), couponApi.brands.list(), couponApi.coupons.list(), couponApi.phases.list()])
      .then(([b, s, c, p]) => {
        setBanners(b);
        setBrands([...s].sort(comparePartnerLogos));
        setCoupons(c);
        setPhases(p);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, []);

  useEffect(load, [load]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const liveLogos = brands.filter((s) => partnerLogoStatus(s, coupons, phases).status === 'visible');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
        <PageHeader
          title={t('Display')}
          icon="solar:gallery-wide-linear"
          description={t('Banners on the Coupon landing screen in the app. These are separate from Media Ads banners. Partner logo order is on the Partners page.')}
        />

        {!canEdit && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#4B5563]">
            <Icon icon="solar:eye-linear" width={18} height={18} className="mt-0.5 flex-shrink-0 text-[#6B7280]" />
            {t('Only Admins can change what shows in the app. You can view everything here.')}
          </p>
        )}

        {loadState === 'loading' ? (
          <div role="status" aria-label={t('Loading')} className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[#F3F4F6] animate-pulse" />
            ))}
          </div>
        ) : loadState === 'error' ? (
          <div className="mt-6 border border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center text-center py-14 px-4">
            <p className="text-sm font-semibold text-[#1A1A1A]">{t('Couldn’t load the display settings')}</p>
            <p className="text-sm text-[#6B7280] mt-1">{t('Something went wrong while loading. Check your connection and try again.')}</p>
            <Button variant="secondary" icon="solar:refresh-linear" onClick={load} className="mt-4">
              {t('Retry')}
            </Button>
          </div>
        ) : (
          <div className="mt-5">
            <BannersTab banners={banners} onBannersChange={setBanners} logos={liveLogos} onToast={onToast} onDirtyChange={onDirtyChange} />
          </div>
        )}
      </div>
    </div>
  );
}
