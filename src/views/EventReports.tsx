import { useState } from 'react';
import { events } from '../data/mock';

export default function EventReports() {
  const [selectedEventId, setSelectedEventId] = useState(1);
  const ev = events.find(e => e.id === selectedEventId) || events[0];
  const attendanceRate = ev.registrants > 0 ? Math.round((ev.checkedIn / ev.registrants) * 100) : 0;
  const surveyRate = ev.checkedIn > 0 ? Math.round((ev.surveyResponses / ev.checkedIn) * 100) : 0;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Event Reports</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Comprehensive overview of event performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(Number(e.target.value))}
            className="flex-1 sm:flex-none px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
          >
            {events.filter(e => e.status !== 'Draft').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="bg-gradient-to-r from-[#FF6115] to-[#E5540F] rounded-xl p-6 text-white">
        <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">PEEP SHARE Event Report</div>
        <h3 className="text-xl font-bold">{ev.name}</h3>
        <p className="text-sm opacity-80 mt-1">{ev.dates} · {ev.location}</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Registered', value: ev.registrants.toLocaleString(), icon: '👥' },
          { label: 'Checked-in', value: ev.checkedIn.toLocaleString(), icon: '✅' },
          { label: 'Attendance', value: `${attendanceRate}%`, icon: '📈' },
          { label: 'Survey Responses', value: ev.surveyResponses.toLocaleString(), icon: '📊' },
          { label: 'Avg. Satisfaction', value: '4.5 / 5', icon: '⭐' },
          { label: 'Photos', value: ev.photos.toLocaleString(), icon: '📷' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-xl font-bold text-[#1A1A1A]">{c.value}</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Registration breakdown */}
        <ReportSection title="Registration" subtitle={`${ev.registrants.toLocaleString()} total registrants`}>
          <ProgressRow label="General" value={Math.round(ev.registrants * 0.72)} total={ev.registrants} />
          <ProgressRow label="VIP" value={Math.round(ev.registrants * 0.28)} total={ev.registrants} />
          <div className="pt-2 border-t border-[#F3F4F6] flex justify-between text-xs">
            <span className="text-[#6B7280]">Attendance Rate</span>
            <span className="font-semibold text-[#FF6115]">{attendanceRate}%</span>
          </div>
        </ReportSection>

        {/* Survey breakdown */}
        <ReportSection title="Survey" subtitle={`${ev.surveyResponses.toLocaleString()} responses collected`}>
          <ProgressRow label="Responded" value={ev.surveyResponses} total={ev.checkedIn || 1} />
          <ProgressRow label="Did not respond" value={Math.max(0, ev.checkedIn - ev.surveyResponses)} total={ev.checkedIn || 1} />
          <div className="pt-2 border-t border-[#F3F4F6] flex justify-between text-xs">
            <span className="text-[#6B7280]">Response Rate</span>
            <span className="font-semibold text-[#FF6115]">{surveyRate}%</span>
          </div>
        </ReportSection>

        {/* Photo Activity */}
        <ReportSection title="Photo Activity" subtitle={`${ev.photos.toLocaleString()} total photos`}>
          <ProgressRow label="Completed" value={Math.round(ev.photos * 0.99)} total={ev.photos || 1} />
          <ProgressRow label="Processing" value={Math.round(ev.photos * 0.007)} total={ev.photos || 1} />
          <ProgressRow label="Failed" value={Math.max(0, ev.photos - Math.round(ev.photos * 0.99) - Math.round(ev.photos * 0.007))} total={ev.photos || 1} />
        </ReportSection>

        {/* Members */}
        <ReportSection title="Event Team" subtitle={`${ev.members} members involved`}>
          {[
            { role: 'Event Admin', count: 2 },
            { role: 'Event Staff', count: 4 },
            { role: 'Photographer', count: 4 },
            { role: 'Viewer', count: ev.members - 10 > 0 ? ev.members - 10 : 2 },
          ].map(m => (
            <div key={m.role} className="flex justify-between py-1.5 text-sm border-b border-[#F3F4F6] last:border-0">
              <span className="text-[#6B7280]">{m.role}</span>
              <span className="font-medium text-[#1A1A1A]">{m.count}</span>
            </div>
          ))}
        </ReportSection>
      </div>
    </div>
  );
}

function ReportSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <h4 className="text-sm font-semibold text-[#1A1A1A]">{title}</h4>
      <p className="text-xs text-[#9CA3AF] mb-4">{subtitle}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#6B7280]">{label}</span>
        <span className="font-medium text-[#1A1A1A]">{value.toLocaleString()} <span className="text-[#9CA3AF]">({pct}%)</span></span>
      </div>
      <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div className="h-full bg-[#FF6115] rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
