import { useState } from 'react';
import { activityLog, events, users } from '../data/mock';

export default function ActivityLog() {
  const [eventFilter, setEventFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = activityLog.filter(a => {
    const matchEvent = eventFilter === 'All' || a.event === eventFilter;
    const matchUser = userFilter === 'All' || a.user.includes(userFilter);
    const matchSearch = a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.details.toLowerCase().includes(search.toLowerCase()) ||
      a.user.toLowerCase().includes(search.toLowerCase());
    return matchEvent && matchUser && matchSearch;
  });

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Activity Log</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">System-wide audit trail of all admin actions</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 sm:min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search actions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
          >
            <option value="All">All Events</option>
            {events.map(e => <option key={e.id}>{e.name}</option>)}
          </select>
          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
          >
            <option value="All">All Users</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">All Activity</h3>
          <span className="text-xs text-[#9CA3AF]">{filtered.length} entries</span>
        </div>

        {/* Table (tablet & desktop) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['Timestamp', 'User', 'Action', 'Event', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#9CA3AF] text-sm">No activity found.</td>
                </tr>
              ) : filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3.5 text-xs text-[#9CA3AF] whitespace-nowrap">{entry.timestamp}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#FF6115]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-[#FF6115]">
                          {entry.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-sm text-[#1A1A1A] whitespace-nowrap">{entry.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{entry.event}</td>
                  <td className="px-4 py-3.5 text-sm text-[#4B5563]">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Timeline (mobile) */}
        <div className="sm:hidden divide-y divide-[#F3F4F6]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#9CA3AF] text-sm">No activity found.</div>
          ) : filtered.map(entry => (
            <div key={entry.id} className="px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[#9CA3AF]">{entry.timestamp}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getActionColor(entry.action)}`}>
                  {entry.action}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-6 h-6 rounded-full bg-[#FF6115]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-[#FF6115]">
                    {entry.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">{entry.user}</span>
              </div>
              <p className="text-sm text-[#4B5563] mt-1">{entry.details}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{entry.event}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getActionColor(action: string): string {
  const map: Record<string, string> = {
    'Added member': 'bg-blue-50 text-blue-600',
    'Changed permissions': 'bg-purple-50 text-purple-700',
    'Uploaded photos': 'bg-green-50 text-green-700',
    'Exported data': 'bg-[#FFF0E8] text-[#FF6115]',
    'Created event': 'bg-green-50 text-green-700',
    'Changed role': 'bg-amber-50 text-amber-700',
    'Viewed report': 'bg-gray-100 text-gray-600',
  };
  return map[action] || 'bg-gray-100 text-gray-600';
}
