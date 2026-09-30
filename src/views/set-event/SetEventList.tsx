import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import StatusTabs from '../../components/ui/StatusTabs';
import SearchInput from '../../components/ui/SearchInput';
import FilterButton from '../../components/ui/FilterButton';
import FilterSelect from '../../components/ui/FilterSelect';
import DateRangePicker from '../../components/ui/DateRangePicker';
import Pagination from '../../components/ui/Pagination';
import EventTable from '../../components/set-event/EventTable';
import {
  EDITABLE_STATUSES,
  EVENT_TABS,
  TICKET_TYPES,
  countByTab,
  queryEvents,
  sortEvents,
  type EventQuery,
  type EventTab,
  type SetEvent,
  type SortState,
} from '../../data/setEvents';

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: Omit<EventQuery, 'tab' | 'search'> = {
  ticketType: 'All',
  status: 'All',
  startDate: '',
  endDate: '',
};

const TICKET_OPTIONS = ['All', ...TICKET_TYPES] as const;
const STATUS_OPTIONS = ['All', ...EDITABLE_STATUSES] as const;

interface SetEventListProps {
  events: SetEvent[];
  onCreate: () => void;
  /** Opens a saved event in the event workspace. */
  onOpen: (event: SetEvent, section: 'overview' | 'detail') => void;
  onDelete: (event: SetEvent) => void;
}

// List UI only — the event data, saving and deleting live in SetEventApp.
export default function SetEventList({ events, onCreate, onOpen, onDelete }: SetEventListProps) {
  const [tab, setTab] = useState<EventTab>('All');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const counts = useMemo(() => countByTab(events), [events]);
  const filtered = useMemo(
    () => sortEvents(queryEvents(events, { tab, search, ...filters }), sort),
    [events, tab, search, filters, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount =
    (filters.ticketType !== 'All' ? 1 : 0) +
    (filters.status !== 'All' ? 1 : 0) +
    (filters.startDate || filters.endDate ? 1 : 0);
  const hasQuery = activeFilterCount > 0 || search.trim() !== '';

  // Any change to what's shown sends the user back to page 1.
  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="px-4 sm:px-6 pt-6 lg:pt-8 pb-5 space-y-5">
          <PageHeader
            title="Event List"
            icon="solar:calendar-linear"
            actions={
              <Button pill icon="solar:add-linear" onClick={onCreate} className="w-full sm:w-auto">
                Create Event
              </Button>
            }
          />

          {/* Tabs + search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <StatusTabs
              tabs={EVENT_TABS}
              active={tab}
              counts={counts}
              onChange={(t) => {
                setTab(t);
                setPage(1);
              }}
              className="min-w-0"
            />
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search"
              className="w-full lg:w-64 flex-shrink-0"
            />
          </div>

          {/* Filters + date range */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <FilterButton
                expanded={filtersOpen}
                activeCount={activeFilterCount}
                onClick={() => setFiltersOpen(!filtersOpen)}
              />
              {filtersOpen && (
                <>
                  <FilterSelect
                    label="Ticket type"
                    value={filters.ticketType}
                    options={TICKET_OPTIONS}
                    onChange={(ticketType) => updateFilters({ ticketType })}
                  />
                  <FilterSelect
                    label="Status"
                    value={filters.status}
                    options={STATUS_OPTIONS}
                    onChange={(status) => updateFilters({ status })}
                  />
                </>
              )}
              <button
                onClick={clearAll}
                disabled={!hasQuery}
                className="h-8 px-1 text-xs text-[#FF6115] hover:text-[#E5540F] disabled:cursor-default disabled:hover:text-[#FF6115] transition-colors"
              >
                Clear
              </button>
            </div>
            {filtersOpen && (
              <DateRangePicker
                start={filters.startDate}
                end={filters.endDate}
                onChange={({ start, end }) => updateFilters({ startDate: start, endDate: end })}
                className="w-full sm:w-auto"
              />
            )}
          </div>
        </div>

        <EventTable
          events={paged}
          sort={sort}
          onSortChange={(next) => {
            setSort(next);
            setPage(1);
          }}
          onOpen={(ev) => onOpen(ev, 'overview')}
          onEdit={(ev) => onOpen(ev, 'detail')}
          onDelete={onDelete}
          emptyState={<EmptyState tab={tab} hasQuery={hasQuery} onClear={clearAll} />}
        />

        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      </div>

    </div>
  );
}

function EmptyState({ tab, hasQuery, onClear }: { tab: EventTab; hasQuery: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
        <Icon icon={hasQuery ? 'solar:magnifer-linear' : 'solar:calendar-linear'} width={22} height={22} className="text-[#9CA3AF]" />
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A]">
        {hasQuery ? 'No events match your filters' : tab === 'Trash' ? 'Trash is empty' : `No ${tab === 'All' ? '' : tab.toLowerCase() + ' '}events yet`}
      </p>
      <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
        {hasQuery
          ? 'Try a different search term, ticket type, status, or date range.'
          : tab === 'Trash'
            ? 'Deleted events appear here before they are removed permanently.'
            : 'Events you create in Set Event will appear in this list.'}
      </p>
      {hasQuery && (
        <button onClick={onClear} className="mt-3 text-sm font-medium text-[#FF6115] hover:text-[#E5540F]">
          Clear filters
        </button>
      )}
    </div>
  );
}
