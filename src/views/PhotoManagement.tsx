import { useState } from 'react';
import { events } from '../data/mock';

type PhotoStatus = 'Uploading' | 'Processing' | 'Completed' | 'Failed';

const STATUS_COLORS: Record<PhotoStatus, string> = {
  Uploading: 'bg-blue-50 text-blue-600',
  Processing: 'bg-amber-50 text-amber-600',
  Completed: 'bg-green-50 text-green-700',
  Failed: 'bg-red-50 text-red-600',
};

export default function PhotoManagement() {
  const [selectedEventId, setSelectedEventId] = useState(1);
  const ev = events.find(e => e.id === selectedEventId) || events[0];
  const completed = Math.round(ev.photos * 0.99);
  const processing = Math.round(ev.photos * 0.007);
  const failed = Math.max(0, ev.photos - completed - processing);
  const uploadProgress = ev.photos > 0 ? 94 : 0;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Photo Management</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Upload, sync, and manage event photos</p>
        </div>
        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
        >
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {/* Event photo overview */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#1A1A1A]">{ev.name}</h3>
            <p className="text-sm text-[#6B7280]">{ev.dates} · {ev.location}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">View Gallery</button>
            {failed > 0 && (
              <button className="px-3 py-1.5 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                Retry Failed ({failed})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {([
            { label: 'Total Photos', value: ev.photos.toLocaleString(), status: null },
            { label: 'Completed', value: completed.toLocaleString(), status: 'Completed' as PhotoStatus },
            { label: 'Processing', value: processing.toLocaleString(), status: 'Processing' as PhotoStatus },
            { label: 'Failed', value: failed.toLocaleString(), status: 'Failed' as PhotoStatus },
          ] as const).map(c => (
            <div key={c.label} className="border border-[#E5E7EB] rounded-xl p-4">
              <div className="text-xl font-bold text-[#1A1A1A]">{c.value}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {c.status && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                )}
                <span className="text-xs text-[#9CA3AF]">{c.status ? '' : c.label}</span>
                {!c.status && <span className="text-xs text-[#9CA3AF]">photos</span>}
              </div>
            </div>
          ))}
        </div>

        {ev.photos > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#6B7280]">Upload progress</span>
              <span className="font-medium text-[#1A1A1A]">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6115] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Upload flow */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Upload New Photos</h3>
        <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center hover:border-[#FF6115]/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-[#FFF0E8] rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#FF6115" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#1A1A1A]">Drop photos here or click to select folder</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Supports JPEG, PNG, RAW · Max 50GB per batch</p>
          <button className="mt-4 px-4 py-2 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium rounded-lg transition-colors">
            Select Folder
          </button>
        </div>

        {/* Workflow steps */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { label: 'Select Folder', done: true },
            { label: 'Scan Photos', done: true },
            { label: 'Detect Existing', done: true },
            { label: 'Identify New', done: true },
            { label: 'Upload / Sync', done: false },
            { label: 'Processing', done: false },
            { label: 'Completed', done: false },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1.5 ${step.done ? 'text-[#FF6115]' : 'text-[#D1D5DB]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? 'bg-[#FF6115] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
                  {step.done ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">{step.label}</span>
              </div>
              {i < arr.length - 1 && <div className="w-5 h-px bg-[#E5E7EB] flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Recent uploads table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Recent Upload Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['Photographer', 'Photos', 'Status', 'Time', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {[
                { user: 'Beam Natthawut', count: 1250, status: 'Completed' as PhotoStatus, time: '09:32' },
                { user: 'Mint Wanida', count: 820, status: 'Completed' as PhotoStatus, time: '10:15' },
                { user: 'Beam Natthawut', count: 30, status: 'Failed' as PhotoStatus, time: '10:22' },
                { user: 'Beam Natthawut', count: 30, status: 'Completed' as PhotoStatus, time: '11:05' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] whitespace-nowrap">{r.user}</td>
                  <td className="px-4 py-3 text-sm text-[#4B5563] whitespace-nowrap">{r.count.toLocaleString()} photos</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#9CA3AF] whitespace-nowrap">Today, {r.time}</td>
                  <td className="px-4 py-3">
                    {r.status === 'Failed' ? (
                      <button className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors">Retry</button>
                    ) : (
                      <button className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Details</button>
                    )}
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
