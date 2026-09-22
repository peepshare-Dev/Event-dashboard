import { useState } from 'react';
import { events, type EventStatus } from '../data/mock';
import type { Event } from '../data/mock';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Event List</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{events.length} events total</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium px-4 py-2.5 sm:py-2 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 sm:min-w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
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
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      {ev.members}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn onClick={() => onSelectEvent(ev)}>View</ActionBtn>
                      <ActionBtn>Edit</ActionBtn>
                      <ActionBtn>Access</ActionBtn>
                      <button className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] rounded transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                        </svg>
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
              className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>
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
              className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
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
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="min-h-[44px] px-4 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>
            <span className="text-xs text-[#6B7280]">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="min-h-[44px] px-4 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
          </div>
        )}
      </div>

      {showCreateModal && <CreateEventModal onClose={() => setShowCreateModal(false)} />}
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
          {active && dir === 'asc' ? '↑' : '↓'}
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

function CreateEventModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-semibold text-[#1A1A1A]">Create New Event</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <Field label="Event Name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter event name" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Start Date">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]" />
            </Field>
            <Field label="End Date">
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]" />
            </Field>
          </div>
          <Field label="Location">
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or venue" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors">Create Event</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#374151]">{label}</label>
      {children}
    </div>
  );
}
