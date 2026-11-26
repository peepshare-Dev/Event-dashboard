import { BRAND_PARTNER_STATUS_LABELS, type BrandPartnerStatus } from '../../../data/coupons';
import { useT } from '@/i18n';

// Dot + label, same look as the other status badges. Contract ended is amber, like Expired.
const STYLES: Record<BrandPartnerStatus, { badge: string; dot: string }> = {
  active: { badge: 'bg-[#F0FDF4] text-[#15803D]', dot: 'bg-[#22C55E]' },
  inactive: { badge: 'bg-[#F3F4F6] text-[#6B7280]', dot: 'bg-[#9CA3AF]' },
  contract_ended: { badge: 'bg-[#FFFBEB] text-[#B45309]', dot: 'bg-[#F59E0B]' },
};

export const BRAND_PARTNER_STATUSES = Object.keys(STYLES) as BrandPartnerStatus[];

export default function BrandPartnerBadge({ status }: { status: BrandPartnerStatus }) {
  const t = useT();
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {t(BRAND_PARTNER_STATUS_LABELS[status])}
    </span>
  );
}
