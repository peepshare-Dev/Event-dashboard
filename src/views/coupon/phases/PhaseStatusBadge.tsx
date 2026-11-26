import { PHASE_STATUS_LABELS, type PhaseStatus } from '../../../data/coupons';
import { useT } from '@/i18n';

// Same look as the Media Ads status badge: Draft outlined, Scheduled blue, Active green, Ended gray.
const STYLES: Record<PhaseStatus, { badge: string; dot: string }> = {
  draft: { badge: 'bg-[#F3F4F6] text-[#4B5563]', dot: 'border border-[#9CA3AF]' },
  scheduled: { badge: 'bg-[#EFF6FF] text-[#1D4ED8]', dot: 'bg-[#3B82F6]' },
  active: { badge: 'bg-[#F0FDF4] text-[#15803D]', dot: 'bg-[#22C55E]' },
  ended: { badge: 'bg-[#F3F4F6] text-[#6B7280]', dot: 'bg-[#9CA3AF]' },
};

export const PHASE_STATUSES = Object.keys(STYLES) as PhaseStatus[];

export default function PhaseStatusBadge({ status }: { status: PhaseStatus }) {
  const t = useT();
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {t(PHASE_STATUS_LABELS[status])}
    </span>
  );
}
