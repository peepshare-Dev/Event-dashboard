import type { SetEventStatus } from '../../data/setEvents';

// Dot + label on a neutral chip, so status never relies on color alone.
const STATUS_STYLES: Record<SetEventStatus, { dot: string; text: string; bg: string }> = {
  Published: { dot: 'bg-[#16A34A]', text: 'text-[#1A1A1A]', bg: 'bg-white border-[#D1D5DB]' },
  Pending: { dot: 'bg-[#2563EB]', text: 'text-[#1A1A1A]', bg: 'bg-white border-[#D1D5DB]' },
  Scheduled: { dot: 'bg-[#7C3AED]', text: 'text-[#1A1A1A]', bg: 'bg-white border-[#D1D5DB]' },
  Draft: { dot: 'bg-[#F59E0B]', text: 'text-[#1A1A1A]', bg: 'bg-white border-[#D1D5DB]' },
  Private: { dot: 'bg-[#9CA3AF]', text: 'text-[#1A1A1A]', bg: 'bg-white border-[#D1D5DB]' },
  Trash: { dot: 'bg-[#DC2626]', text: 'text-[#B91C1C]', bg: 'bg-[#FEF2F2] border-[#FECACA]' },
};

export const STATUS_DOT: Record<SetEventStatus, string> = Object.fromEntries(
  Object.entries(STATUS_STYLES).map(([status, style]) => [status, style.dot]),
) as Record<SetEventStatus, string>;

interface StatusBadgeProps {
  status: SetEventStatus;
  /** 'chip' for table cells; 'pill' for page headers. */
  shape?: 'chip' | 'pill';
}

export default function StatusBadge({ status, shape = 'chip' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  const shapeClass =
    shape === 'pill' ? 'rounded-full px-2.5 py-1 bg-[#F9FAFB] border-transparent' : `rounded-[4px] px-1.5 py-0.5 ${style.bg}`;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs border whitespace-nowrap ${shapeClass} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}
