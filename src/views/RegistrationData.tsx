import { useState } from 'react';
import { registrationData, events, type Event } from '../data/mock';
import { Icon } from '@iconify/react';

interface RegistrationDataProps {
  inEvent?: boolean;
  eventId?: number;
}

export default function RegistrationData({ inEvent, eventId }: RegistrationDataProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const activeEventId = inEvent ? eventId ?? null : selectedEventId;

  if (activeEventId != null) {
    const ev = events.find(e => e.id === activeEventId);
    if (ev) {
      return (
        <EventRegistrationDetail
          event={ev}
          onBack={inEvent ? undefined : () => setSelectedEventId(null)}
        />
      );
    }
  }

  const eventsWithData = events.filter(e => registrationData.some(r => r.eventId === e.id));

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Registration Data</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Select an event to view and export its registration records</p>
      </div>

      {eventsWithData.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] py-16 text-center">
          <div className="flex flex-col items-center gap-2">
            <Icon icon="solar:clipboard-list-linear" width={32} height={32} color="#D1D5DB" />
            <p className="text-sm font-medium text-[#1A1A1A] mt-2">No registration data yet</p>
          </div>
        </div>
      ) : (
        <>
          {/* Table (tablet & desktop) */}
          <div className="hidden sm:block bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    {['#', 'Event', 'Date', 'Location', 'Registrants', 'Checked-in', 'Attendance Rate'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {eventsWithData.map((ev, i) => {
                    const rows = registrationData.filter(r => r.eventId === ev.id);
                    const checkedIn = rows.filter(r => r.checkedIn).length;
                    const rate = rows.length > 0 ? Math.round((checkedIn / rows.length) * 100) : 0;
                    return (
                      <tr key={ev.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-4 py-3.5 text-sm text-[#9CA3AF]">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedEventId(ev.id)}
                            className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] transition-colors text-left whitespace-nowrap"
                          >
                            {ev.name}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{ev.dates}</td>
                        <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{ev.location}</td>
                        <td className="px-4 py-3.5 text-sm font-medium text-[#1A1A1A]">{rows.length}</td>
                        <td className="px-4 py-3.5 text-sm text-green-600 font-medium">{checkedIn}</td>
                        <td className="px-4 py-3.5 text-sm font-medium text-[#FF6115]">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards (mobile) */}
          <div className="sm:hidden space-y-3">
            {eventsWithData.map(ev => {
              const rows = registrationData.filter(r => r.eventId === ev.id);
              const checkedIn = rows.filter(r => r.checkedIn).length;
              const rate = rows.length > 0 ? Math.round((checkedIn / rows.length) * 100) : 0;
              return (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className="w-full text-left bg-white rounded-xl border border-[#E5E7EB] p-4 hover:border-[#FF6115]/40 transition-colors"
                >
                  <div className="text-sm font-medium text-[#1A1A1A]">{ev.name}</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{ev.dates} · {ev.location}</div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-[#4B5563]">
                    <span>{rows.length} Registrants</span>
                    <span className="text-green-600">{checkedIn} Checked-in</span>
                    <span className="text-[#FF6115] font-medium">{rate}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EventRegistrationDetail({ event, onBack }: { event: Event; onBack?: () => void }) {
  const [search, setSearch] = useState('');
  const [checkinFilter, setCheckinFilter] = useState<'All' | 'Checked In' | 'Not Checked In'>('All');

  const eventRows = registrationData.filter(r => r.eventId === event.id);

  const filtered = eventRows.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.username.toLowerCase().includes(search.toLowerCase());
    const matchCheckin = checkinFilter === 'All' ||
      (checkinFilter === 'Checked In' && r.checkedIn) ||
      (checkinFilter === 'Not Checked In' && !r.checkedIn);
    return matchSearch && matchCheckin;
  });

  const checkedIn = filtered.filter(r => r.checkedIn).length;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      {onBack && (
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <button onClick={onBack} className="hover:text-[#FF6115] transition-colors">Registration Data</button>
          <span>/</span>
          <span className="text-[#1A1A1A] font-medium truncate">{event.name}</span>
        </div>
      )}

      {!onBack && (
        <div>
          <h3 className="text-base font-semibold text-[#1A1A1A]">Registration Data</h3>
          <p className="text-sm text-[#6B7280]">{event.name}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard label="Total Registrants" value={filtered.length.toString()} color="text-[#1A1A1A]" />
        <SummaryCard label="Checked-in" value={checkedIn.toString()} color="text-green-600" />
        <SummaryCard label="Attendance Rate" value={filtered.length > 0 ? `${Math.round((checkedIn / filtered.length) * 100)}%` : '—'} color="text-[#FF6115]" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-48">
          <Icon icon="solar:magnifer-linear" width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search registrants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['All', 'Checked In', 'Not Checked In'] as const).map(f => (
            <button
              key={f}
              onClick={() => setCheckinFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${checkinFilter === f ? 'bg-[#FF6115] border-[#FF6115] text-white' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6115] hover:text-[#FF6115]'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
            <Icon icon="solar:download-linear" width={13} height={13} />
            CSV
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
            <Icon icon="solar:download-linear" width={13} height={13} />
            Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['#', 'Name', 'Phone', 'Email', 'PEEP SHARE Username', 'Ticket Type', 'Event Date', 'Check-in'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#9CA3AF] text-sm">No registrants found.</td>
                </tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 text-sm text-[#9CA3AF]">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] whitespace-nowrap">{r.phone}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{r.email}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{r.username}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${r.ticketType === 'VIP' ? 'bg-purple-50 text-purple-700' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                      {r.ticketType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] whitespace-nowrap">{r.eventDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${r.checkedIn ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.checkedIn ? <Icon icon="solar:check-circle-bold" width={12} height={12} /> : <Icon icon="solar:minus-circle-linear" width={12} height={12} />}
                      {r.checkedIn ? 'In' : 'Out'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-[#6B7280] mt-0.5">{label}</div>
    </div>
  );
}
