import type { BannerDisplayStatus } from '../../../data/appBanners';

const STYLES: Record<BannerDisplayStatus, { badge: string; dot: string }> = {
  Active: { badge: 'bg-[#F0FDF4] text-[#15803D]', dot: 'bg-[#22C55E]' },
  Scheduled: { badge: 'bg-[#EFF6FF] text-[#1D4ED8]', dot: 'bg-[#3B82F6]' },
  Draft: { badge: 'bg-[#F3F4F6] text-[#4B5563]', dot: 'border border-[#9CA3AF]' },
  Inactive: { badge: 'bg-[#F3F4F6] text-[#6B7280]', dot: 'bg-[#9CA3AF]' },
  Expired: { badge: 'bg-[#FFFBEB] text-[#B45309]', dot: 'bg-[#F59E0B]' },
};

export const PROMO_STATUSES = Object.keys(STYLES) as BannerDisplayStatus[];

// Dot + label, so status never relies on colour alone.
export default function PromoStatusBadge({ status }: { status: BannerDisplayStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}
