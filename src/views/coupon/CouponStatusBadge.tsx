import { COUPON_STATUS_LABELS, type CouponDisplayStatus } from '../../data/coupons';
import { useT } from '@/i18n';

// Same colours as the campaign badge for the dates (Scheduled blue, Active green, ended gray).
const STYLES: Record<CouponDisplayStatus, { badge: string; dot: string }> = {
  active: { badge: 'bg-[#F0FDF4] text-[#15803D]', dot: 'bg-[#22C55E]' },
  scheduled: { badge: 'bg-[#EFF6FF] text-[#1D4ED8]', dot: 'bg-[#3B82F6]' },
  campaign_ended: { badge: 'bg-[#F3F4F6] text-[#6B7280]', dot: 'bg-[#9CA3AF]' },
  no_campaign: { badge: 'bg-[#F3F4F6] text-[#4B5563]', dot: 'border border-[#9CA3AF]' },
  inactive: { badge: 'bg-[#F3F4F6] text-[#374151]', dot: 'bg-[#4B5563]' },
  expired: { badge: 'bg-[#FFFBEB] text-[#B45309]', dot: 'bg-[#F59E0B]' },
  out_of_stock: { badge: 'bg-[#FEF2F2] text-[#B91C1C]', dot: 'bg-[#DC2626]' },
};

export const COUPON_STATUSES = Object.keys(STYLES) as CouponDisplayStatus[];

// Dot + label, so status never relies on colour alone (same look as the Media Ads status badge).
export default function CouponStatusBadge({ status }: { status: CouponDisplayStatus }) {
  const t = useT();
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {t(COUPON_STATUS_LABELS[status])}
    </span>
  );
}
