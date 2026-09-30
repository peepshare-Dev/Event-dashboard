import { Icon } from '@iconify/react';

interface FilterButtonProps {
  expanded: boolean;
  activeCount?: number;
  onClick: () => void;
  label?: string;
}

export default function FilterButton({ expanded, activeCount = 0, onClick, label = 'Filter by' }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className="inline-flex items-center gap-1 h-8 px-2.5 text-xs text-[#4B5563] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
    >
      <Icon icon="solar:filter-linear" width={13} height={13} />
      {label}
      {activeCount > 0 && (
        <span className="ml-0.5 text-[10px] font-semibold bg-[#FF6115] text-white rounded-full px-1.5 py-0.5 leading-none">
          {activeCount}
        </span>
      )}
    </button>
  );
}
