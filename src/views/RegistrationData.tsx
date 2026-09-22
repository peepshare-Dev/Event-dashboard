import { useState } from 'react';
import { registrationData, events } from '../data/mock';

interface RegistrationDataProps {
  inEvent?: boolean;
}

export default function RegistrationData({ inEvent }: RegistrationDataProps) {
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('1');
  const [checkinFilter, setCheckinFilter] = useState<'All' | 'Checked In' | 'Not Checked In'>('All');

  const filtered = registrationData.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.username.toLowerCase().includes(search.toLowerCase());
    const matchCheckin = checkinFilter === 'All' ||
      (checkinFilter === 'Checked In' && r.checkedIn) ||
      (checkinFilter === 'Not Checked In' && !r.checkedIn);
    return matchSearch && matchCheckin;
  });

  const totalRegistrants = filteredTotal(filtered.length);
  const checkedIn = filtered.filter(r => r.checkedIn).length;

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <div className="space-y-4">
        {!inEvent && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Registration Data</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">View and export registration records per event</p>
            </div>
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
          {!inEvent && (
            <select
              value={eventFilter}
              onChange={e => setEventFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
            >
              {events.map(e => <option key={e.id} value={e.id.toString()}>{e.name}</option>)}
            </select>
          )}
          <div className="relative flex-1 sm:min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
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
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              CSV
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
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
                  {['#', 'Name', 'Phone', 'Email', 'PEEP SHARE Username', 'Ticket Type', 'Event Date', 'Check-in', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filtered.map((r, i) => (
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
                        {r.checkedIn ? '✓ In' : '— Out'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

function filteredTotal(n: number) { return n; }
