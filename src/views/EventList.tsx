import { useState } from 'react';
import { events, type EventStatus } from '../data/mock';
import type { Event } from '../data/mock';
import { Icon } from '@iconify/react';

const STATUS_COLORS: Record<EventStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Upcoming: 'bg-blue-50 text-blue-600',
  Ongoing: 'bg-green-50 text-green-700',
  Completed: 'bg-[#FFF0E8] text-[#FF6115]',
  Archived: 'bg-gray-100 text-gray-400',
};

const ALL_STATUSES: EventStatus[] = ['Draft', 'Upcoming', 'Ongoing', 'Completed', 'Archived'];

interface EventListProps {
  onSelectEvent: (event: Event) => void;
}

export default function EventList({ onSelectEvent }: EventListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'All'>('All');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<'name' | 'dates' | 'registrants' | 'photos'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortCol === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortCol === 'registrants') cmp = a.registrants - b.registrants;
    else if (sortCol === 'photos') cmp = a.photos - b.photos;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSort(col: typeof sortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Event List</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">{events.length} events total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 sm:min-w-52">
          <Icon icon="solar:magnifer-linear" width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['All', ...ALL_STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                statusFilter === s
                  ? 'bg-[#FF6115] border-[#FF6115] text-white'
                  : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6115] hover:text-[#FF6115]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table (tablet & desktop) */}
      <div className="hidden sm:block bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide w-10">#</th>
                <SortTh label="Event Name" col="name" current={sortCol} dir={sortDir} onToggle={toggleSort} />
                <SortTh label="Date" col="dates" current={sortCol} dir={sortDir} onToggle={toggleSort} />
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                <SortTh label="Registrants" col="registrants" current={sortCol} dir={sortDir} onToggle={toggleSort} />
                <SortTh label="Photos" col="photos" current={sortCol} dir={sortDir} onToggle={toggleSort} />
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Members</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#9CA3AF] text-sm">No events found.</td>
                </tr>
              ) : paged.map((ev, idx) => (
                <tr key={ev.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="px-4 py-3.5 text-sm text-[#9CA3AF]">{(page - 1) * perPage + idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => onSelectEvent(ev)}
                      className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] transition-colors text-left"
                    >
                      {ev.name}
                    </button>
                    <div className="text-xs text-[#9CA3AF]">{ev.location}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#4B5563] whitespace-nowrap">{ev.dates}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[ev.status]}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#4B5563]">{ev.registrants.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-[#4B5563]">{ev.photos.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-sm text-[#4B5563]">
                      <Icon icon="solar:users-group-rounded-linear" width={13} height={13} />
                      {ev.members}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn onClick={() => onSelectEvent(ev)}>View</ActionBtn>
                      <ActionBtn>Edit</ActionBtn>
                      <ActionBtn>Access</ActionBtn>
                      <button className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] rounded transition-colors">
                        <Icon icon="solar:menu-dots-linear" width={14} height={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-[#6B7280]">
            Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            ><Icon icon="solar:arrow-left-linear" width={12} height={12} /> Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded-lg transition-colors ${p === page ? 'bg-[#FF6115] text-white' : 'text-[#6B7280] hover:bg-[#F9FAFB]'}`}
              >{p}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next <Icon icon="solar:arrow-right-linear" width={12} height={12} /></button>
          </div>
        </div>
      </div>

      {/* Cards (mobile) */}
      <div className="sm:hidden space-y-3">
        {paged.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] text-center py-12 text-[#9CA3AF] text-sm">No events found.</div>
        ) : paged.map(ev => (
          <div key={ev.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={() => onSelectEvent(ev)}
                className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] transition-colors text-left"
              >
                {ev.name}
              </button>
              <span className={`inline-flex flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[ev.status]}`}>
                {ev.status}
              </span>
            </div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">{ev.dates} · {ev.location}</div>

            <div className="flex items-center gap-4 mt-3 text-sm text-[#4B5563]">
              <span>{ev.registrants.toLocaleString()} Registrants</span>
              <span>{ev.photos.toLocaleString()} Photos</span>
              <span className="inline-flex items-center gap-1">
                <Icon icon="solar:users-group-rounded-linear" width={13} height={13} />
                {ev.members}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F4F6]">
              <button
                onClick={() => onSelectEvent(ev)}
                className="min-h-[44px] px-4 text-sm font-medium text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors"
              >
                View Event
              </button>
              <button className="w-11 h-11 flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] rounded-lg transition-colors" aria-label="More actions">
                <Icon icon="solar:menu-dots-linear" width={16} height={16} />
              </button>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 min-h-[44px] px-4 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            ><Icon icon="solar:arrow-left-linear" width={14} height={14} /> Prev</button>
            <span className="text-xs text-[#6B7280]">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 min-h-[44px] px-4 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next <Icon icon="solar:arrow-right-linear" width={14} height={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortTh({ label, col, current, dir, onToggle }: {
  label: string; col: string; current: string; dir: 'asc' | 'desc';
  onToggle: (col: any) => void;
}) {
  const active = col === current;
  return (
    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
      <button onClick={() => onToggle(col)} className="flex items-center gap-1 hover:text-[#1A1A1A] transition-colors">
        {label}
        <span className={active ? 'text-[#FF6115]' : 'text-[#D1D5DB]'}>
          <Icon icon={active && dir === 'asc' ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} width={11} height={11} />
        </span>
      </button>
    </th>
  );
}

function ActionBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}

