import { Icon } from '@iconify/react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

type PageItem = number | 'ellipsis-left' | 'ellipsis-right';

// 1 2 3 … 8 9 10 at the edges; 1 … 4 5 6 … 10 in the middle.
export function getPageItems(page: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3 || page >= total - 2) return [1, 2, 3, 'ellipsis-left', total - 2, total - 1, total];
  return [1, 'ellipsis-left', page - 1, page, page + 1, 'ellipsis-right', total];
}

const navButtonClass =
  'inline-flex items-center gap-2 h-9 px-3.5 text-sm font-semibold text-[#1A1A1A] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40';

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 px-4 sm:px-6 py-6">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className={navButtonClass}>
        <Icon icon="solar:arrow-left-linear" width={18} height={18} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`w-10 h-10 text-sm rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
                item === page ? 'bg-[#FFF0E8] text-[#FF6115] font-medium' : 'text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="w-10 h-10 flex items-center justify-center text-sm text-[#374151]">
              …
            </span>
          ),
        )}
      </div>
      <span className="sm:hidden text-sm text-[#6B7280]">
        Page <span className="font-medium text-[#1A1A1A]">{page}</span> of {totalPages}
      </span>

      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={navButtonClass}>
        <span className="hidden sm:inline">Next</span>
        <Icon icon="solar:arrow-right-linear" width={18} height={18} />
      </button>
    </nav>
  );
}
