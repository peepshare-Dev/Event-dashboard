import { Icon } from '@iconify/react';
import StatusBadge from '../ui/StatusBadge';
import { formatEventDateTime, type SetEvent, type SortKey, type SortState } from '../../data/setEvents';
import { useT } from '@/i18n';

interface EventTableProps {
  events: SetEvent[];
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  onEdit: (event: SetEvent) => void;
  /** Clicking the event name; falls back to onEdit. */
  onOpen?: (event: SetEvent) => void;
  onDelete: (event: SetEvent) => void;
  /** Copy the event as a new Draft. Not offered for events in Trash. */
  onDuplicate?: (event: SetEvent) => void;
  /** Row to highlight briefly, e.g. a copy that was just added. */
  highlightId?: number | null;
  emptyState?: React.ReactNode;
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'id', label: 'Event ID' },
  { key: 'name', label: 'Event Name' },
  { key: 'author', label: 'Author' },
  { key: 'category', label: 'Category' },
  { key: 'registrants', label: 'Registrants' },
  { key: 'status', label: 'Status Event' },
  { key: 'startTime', label: 'Event Start Time' },
  { key: 'endTime', label: 'Event End Time' },
];

const cellClass = 'px-5 first:pl-6 text-[13px] text-[#1A1A1A] whitespace-nowrap border-r border-[#F0F0F0]';

export default function EventTable({ events, sort, onSortChange, onEdit, onOpen, onDelete, onDuplicate, highlightId, emptyState }: EventTableProps) {
  const t = useT();
  // Cycle: unsorted → ascending → descending → unsorted.
  const toggleSort = (key: SortKey) => {
    if (sort?.key !== key) onSortChange({ key, dir: 'asc' });
    else if (sort.dir === 'asc') onSortChange({ key, dir: 'desc' });
    else onSortChange(null);
  };

  return (
    <div className="overflow-x-auto border-b border-[#E5E7EB]">
      <table className="w-full min-w-[1120px]">
        <thead>
          <tr className="border-y border-[#E5E7EB]">
            {COLUMNS.map((col) => {
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className="h-11 px-5 first:pl-6 text-left border-r border-[#F0F0F0]"
                >
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#374151] hover:text-[#1A1A1A] whitespace-nowrap transition-colors"
                  >
                    {t(col.label)}
                    <Icon
                      icon={active && sort.dir === 'asc' ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'}
                      width={12}
                      height={12}
                      className={active ? 'text-[#FF6115]' : 'text-[#C4C9D2]'}
                    />
                  </button>
                </th>
              );
            })}
            {/* Sticky so row actions stay reachable while the table scrolls horizontally. */}
            <th scope="col" className="sticky right-0 bg-white w-20">
              <span className="sr-only">{t('Actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F0F0]">
          {events.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + 1}>{emptyState}</td>
            </tr>
          ) : (
            events.map((ev) => (
              <tr
                key={ev.id}
                data-event-row={ev.id}
                className={`group h-[70px] transition-colors duration-700 ${ev.id === highlightId ? 'bg-[#FFF5EF]' : 'hover:bg-[#FAFAFA]'}`}
              >
                <td className={cellClass}>
                  <span className="inline-flex items-center gap-2">
                    {ev.id}
                    {ev.id === highlightId && <span className="text-[10px] font-semibold text-[#E5540F] bg-[#FFE4D4] px-1.5 py-0.5 rounded">{t('NEW')}</span>}
                  </span>
                </td>
                <td className={cellClass}>
                  <button onClick={() => (onOpen ?? onEdit)(ev)} className="hover:text-[#FF6115] transition-colors text-left">
                    {ev.name || t('Untitled')}
                  </button>
                </td>
                <td className={cellClass}>{ev.author}</td>
                <td className={cellClass}>{ev.category ? t(ev.category) : '—'}</td>
                <td className={cellClass}>
                  <span className="inline-flex items-center gap-1.5 text-[15px]">
                    <Icon icon="solar:users-group-rounded-linear" width={15} height={15} className="text-[#4B5563]" />
                    {ev.registrants.toLocaleString()}
                  </span>
                </td>
                <td className={cellClass}>
                  <StatusBadge status={ev.status} />
                </td>
                <td className={cellClass}>{formatEventDateTime(ev.startTime)}</td>
                <td className={cellClass}>{formatEventDateTime(ev.endTime)}</td>
                <td
                  className={`sticky right-0 transition-colors duration-700 px-3 ${ev.id === highlightId ? 'bg-[#FFF5EF]' : 'bg-white group-hover:bg-[#FAFAFA]'}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <RowAction label={t('Edit {name}', { name: ev.name })} icon="solar:pen-new-square-linear" onClick={() => onEdit(ev)} />
                    {onDuplicate && ev.status !== 'Trash' && (
                      <RowAction label={t('Duplicate {name}', { name: ev.name })} icon="solar:copy-linear" onClick={() => onDuplicate(ev)} />
                    )}
                    <RowAction label={t('Delete {name}', { name: ev.name })} icon="solar:trash-bin-trash-linear" onClick={() => onDelete(ev)} destructive />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RowAction({ label, icon, onClick, destructive }: { label: string; icon: string; onClick: () => void; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        destructive ? 'hover:text-[#DC2626] hover:bg-[#FEF2F2]' : 'hover:text-[#FF6115] hover:bg-[#FFF0E8]'
      }`}
    >
      <Icon icon={icon} width={20} height={20} />
    </button>
  );
}
