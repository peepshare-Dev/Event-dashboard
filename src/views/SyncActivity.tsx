import { useState } from 'react';
import { syncActivity, events } from '../data/mock';
import type { SyncStatus } from '../data/mock';

const STATUS_COLORS: Record<SyncStatus, string> = {
  Uploading: 'bg-blue-50 text-blue-600',
  Processing: 'bg-amber-50 text-amber-600',
  Completed: 'bg-green-50 text-green-700',
  Failed: 'bg-red-50 text-red-600',
};

export default function SyncActivity() {
  const [eventFilter, setEventFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<SyncStatus | 'All'>('All');

  const filtered = syncActivity.filter(s => {
    const matchEvent = eventFilter === 'All' || s.event === eventFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchEvent && matchStatus;
  });

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Sync Activity</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Photo upload and synchronization log</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={eventFilter}
          onChange={e => setEventFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
        >
          <option value="All">All Events</option>
          {events.map(e => <option key={e.id}>{e.name}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Completed', 'Processing', 'Uploading', 'Failed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${statusFilter === s ? 'bg-[#FF6115] border-[#FF6115] text-white' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6115] hover:text-[#FF6115]'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Activity Log</h3>
          <span className="text-xs text-[#9CA3AF]">{filtered.length} entries</span>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {filtered.map(entry => (
            <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
              <div className="text-xs text-[#9CA3AF] whitespace-nowrap w-10 mt-0.5">{entry.time}</div>
              <div className="w-8 h-8 rounded-full bg-[#FF6115]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#FF6115]">
                  {entry.user === 'System' ? 'SYS' : entry.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#1A1A1A]">{entry.user}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[entry.status]}`}>{entry.status}</span>
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  {entry.action} <span className="font-medium text-[#4B5563]">{entry.count.toLocaleString()} photos</span>
                </p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{entry.event}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#9CA3AF] text-sm">No sync activity found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
