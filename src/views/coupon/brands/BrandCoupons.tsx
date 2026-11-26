import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import type { Brand, Coupon, Phase } from '../../../data/coupons';
import type { ToastAction } from '../CouponApp';
import { ActiveSwitch, RemainingBar } from '../coupons/CouponCells';
import { useCouponActivation } from '../coupons/useCouponActivation';
import { useCan } from '../CouponRoleContext';
import { useCouponFormat } from '../format';
import PhaseStatusBadge from '../phases/PhaseStatusBadge';
import { StateBox } from '../phases/PhaseList';
import { useT } from '@/i18n';

interface BrandCouponsProps {
  brand: Brand;
  /** Every coupon (the brand's are picked out here, so toggles update the shared list). */
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  phases: Phase[];
  onOpenCoupon: (id: string) => void;
  onCreateCoupon: () => void;
  onToast: (message: string, action?: ToastAction) => void;
}

// Coupons tab: the partner's coupons not yet in a campaign, then every campaign newest first, with the Coupon list's Active switch.
export default function BrandCoupons({ brand, coupons, setCoupons, phases, onOpenCoupon, onCreateCoupon, onToast }: BrandCouponsProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const canEdit = useCan('coupon.write');
  const { actionError, toggleOne } = useCouponActivation(coupons, setCoupons, onToast);
  const own = coupons.filter((c) => c.brandId === brand.id);
  const byTitle = (a: Coupon, b: Coupon) => a.title.localeCompare(b.title, 'th');
  const groups: { phase?: Phase; coupons: Coupon[] }[] = [
    { coupons: own.filter((c) => !c.phaseId).sort(byTitle) },
    ...[...phases].sort((a, b) => b.startDate.localeCompare(a.startDate)).map((phase) => ({ phase, coupons: own.filter((c) => c.phaseId === phase.id).sort(byTitle) })),
  ].filter((g) => g.coupons.length);
  const phaseCount = groups.filter((g) => g.phase).length;

  return (
    <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1A1A1A]">{t('Coupons for {name}', { name: brand.name })}</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">{t('{count} coupons across {phases} campaigns', { count: own.length, phases: phaseCount })}</p>
        </div>
        {canEdit && (
          <Button pill icon="solar:add-linear" onClick={onCreateCoupon} className="whitespace-nowrap">
            {t('Create coupon')}
          </Button>
        )}
      </div>

      {actionError && (
        <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
          {actionError}
        </p>
      )}

      {own.length === 0 ? (
        <StateBox icon="solar:ticket-sale-linear" title={t('No coupons for this partner yet')} text={t('Create a coupon, then add it to a campaign on the Campaigns page.')}>
          {canEdit && (
            <Button icon="solar:add-linear" onClick={onCreateCoupon}>
              {t('Create coupon')}
            </Button>
          )}
        </StateBox>
      ) : (
        // One table at every width (it scrolls sideways on phones), so each switch exists once.
        <div className="mt-4 overflow-x-auto border-b border-[#E5E7EB]">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                <th scope="col" className="h-11 pl-4 pr-2 w-[76px]">
                  <span className="sr-only">{t('Image')}</span>
                </th>
                <th scope="col" className="px-3">{t('Title')}</th>
                <th scope="col" className="px-3">{t('Remaining / total')}</th>
                <th scope="col" className="px-3 text-right">{t('Viewers')}</th>
                <th scope="col" className="px-3">{t('Expires')}</th>
                <th scope="col" className="px-3 pr-4">{t('Active')}</th>
              </tr>
            </thead>
            {groups.map(({ phase, coupons: list }) => (
              <tbody key={phase?.id ?? 'none'} className="text-[13px] text-[#374151]">
                <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
                  <th scope="rowgroup" colSpan={6} className="pl-4 px-3 py-2.5 text-left font-normal">
                    {phase ? (
                      <span className="inline-flex flex-wrap items-center gap-2.5">
                        <span className="text-sm font-semibold text-[#1A1A1A]">{phase.name}</span>
                        <PhaseStatusBadge status={phase.status} />
                        <span className="text-xs text-[#6B7280]">
                          {fmt.date(phase.startDate)} – {fmt.date(phase.endDate)}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex flex-wrap items-center gap-2.5">
                        <span className="text-sm font-semibold text-[#1A1A1A]">{t('Not in a campaign')}</span>
                        <span className="text-xs text-[#6B7280]">{t('Add these on the Campaigns page to show them in the app.')}</span>
                      </span>
                    )}
                  </th>
                </tr>
                {list.map((c) => (
                  <tr key={c.id} className="border-t border-[#F0F0F0] hover:bg-[#FAFAFA]">
                    <td className="pl-4 pr-2 py-3">
                      <img src={c.couponImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover bg-[#F3F4F6]" />
                    </td>
                    <td className="px-3 max-w-[280px]">
                      <button type="button" onClick={() => onOpenCoupon(c.id)} className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline break-words">
                        {c.title}
                      </button>
                    </td>
                    <td className="px-3">
                      <RemainingBar coupon={c} />
                    </td>
                    <td className="px-3 text-right tabular-nums">{fmt.number(c.viewerCount)}</td>
                    <td className="px-3 whitespace-nowrap">
                      {fmt.date(c.expiresAt)}
                      <span className="block text-xs text-[#9CA3AF]">{fmt.time(c.expiresAt)}</span>
                    </td>
                    <td className="px-3 pr-4">
                      <ActiveSwitch coupon={c} phases={phases} onChange={(on) => toggleOne(c, on)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </section>
  );
}
