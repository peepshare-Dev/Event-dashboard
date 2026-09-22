import { useState } from 'react';
import type { Event } from '../data/mock';
import MembersAccess from './MembersAccess';
import RegistrationData from './RegistrationData';
import SurveyFeedback from './SurveyFeedback';

const TABS = ['Overview', 'Registration', 'Survey', 'Photos', 'Members & Access', 'Settings'] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Upcoming: 'bg-blue-50 text-blue-600',
  Ongoing: 'bg-green-50 text-green-700',
  Completed: 'bg-[#FFF0E8] text-[#FF6115]',
  Archived: 'bg-gray-100 text-gray-400',
};

interface EventDetailProps {
  event: Event;
  onBack: () => void;
}

export default function EventDetail({ event, onBack }: EventDetailProps) {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <button onClick={onBack} className="hover:text-[#FF6115] transition-colors">Event List</button>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium truncate">{event.name}</span>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">{event.name}</h2>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>{event.status}</span>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">{event.dates} · {event.location}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex-1 lg:flex-none px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">Edit Event</button>
          <button className="flex-1 lg:flex-none px-4 py-2 text-sm bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors font-medium">Export Report</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Registered', value: event.registrants.toLocaleString(), icon: '👥', color: 'text-blue-600' },
          { label: 'Checked-in', value: event.checkedIn.toLocaleString(), icon: '✅', color: 'text-green-600' },
          { label: 'Survey Responses', value: event.surveyResponses.toLocaleString(), icon: '📊', color: 'text-purple-600' },
          { label: 'Photos', value: event.photos.toLocaleString(), icon: '📷', color: 'text-[#FF6115]' },
          { label: 'Members', value: event.members.toString(), icon: '🧑‍💼', color: 'text-[#1A1A1A]' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="text-xl mb-1">{c.icon}</div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-4 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#FF6115] text-[#FF6115]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div>
          {tab === 'Overview' && <OverviewTab event={event} />}
          {tab === 'Registration' && <RegistrationData inEvent />}
          {tab === 'Survey' && <SurveyFeedback inEvent />}
          {tab === 'Photos' && <PhotosTab event={event} />}
          {tab === 'Members & Access' && <MembersAccess />}
          {tab === 'Settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ event }: { event: Event }) {
  const attendanceRate = event.registrants > 0 ? Math.round((event.checkedIn / event.registrants) * 100) : 0;
  const surveyRate = event.checkedIn > 0 ? Math.round((event.surveyResponses / event.checkedIn) * 100) : 0;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Overview */}
        <Section title="Registration Overview">
          <Stat label="Total Registered" value={event.registrants.toLocaleString()} />
          <Stat label="Checked-in" value={event.checkedIn.toLocaleString()} />
          <Stat label="Attendance Rate" value={`${attendanceRate}%`} accent />
          <div className="mt-3 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF6115] rounded-full transition-all" style={{ width: `${attendanceRate}%` }} />
          </div>
        </Section>

        {/* Survey Overview */}
        <Section title="Survey Overview">
          <Stat label="Total Responses" value={event.surveyResponses.toLocaleString()} />
          <Stat label="Response Rate" value={`${surveyRate}%`} accent />
          <Stat label="Avg. Satisfaction" value="4.5 / 5" />
          <div className="mt-3 flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= 4 ? '#FF6115' : '#E5E7EB'} stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </Section>

        {/* Photo Activity */}
        <Section title="Photo Activity">
          <Stat label="Total Photos" value={event.photos.toLocaleString()} />
          <Stat label="Completed" value={Math.round(event.photos * 0.99).toLocaleString()} />
          <Stat label="Processing" value={Math.round(event.photos * 0.007).toLocaleString()} />
          <Stat label="Failed" value={Math.round(event.photos * 0.003).toLocaleString()} />
        </Section>

        {/* Recent Activity */}
        <Section title="Recent Activity">
          {[
            { time: '10:15', text: 'Beam uploaded 820 photos', type: 'photo' },
            { time: '11:00', text: 'Aom exported Registration Data', type: 'export' },
            { time: '12:30', text: 'Nong viewed Event Report', type: 'view' },
            { time: '14:05', text: 'Admin added new member', type: 'member' },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-[#F3F4F6] last:border-0">
              <span className="text-xs text-[#9CA3AF] whitespace-nowrap mt-0.5 w-10">{a.time}</span>
              <span className="text-sm text-[#4B5563]">{a.text}</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#E5E7EB] rounded-xl p-5 space-y-1">
      <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">{title}</h4>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className={`text-sm font-semibold ${accent ? 'text-[#FF6115]' : 'text-[#1A1A1A]'}`}>{value}</span>
    </div>
  );
}

function PhotosTab({ event }: { event: Event }) {
  const completed = Math.round(event.photos * 0.99);
  const processing = Math.round(event.photos * 0.007);
  const failed = event.photos - completed - processing;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Photos', value: event.photos.toLocaleString(), color: 'text-[#1A1A1A]' },
          { label: 'Completed', value: completed.toLocaleString(), color: 'text-green-600' },
          { label: 'Processing', value: processing.toLocaleString(), color: 'text-amber-600' },
          { label: 'Failed', value: Math.max(0, failed).toLocaleString(), color: 'text-red-500' },
        ].map(c => (
          <div key={c.label} className="border border-[#E5E7EB] rounded-xl p-4">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="border border-[#E5E7EB] rounded-xl p-5">
        <p className="text-sm text-[#6B7280]">Photo gallery grid would appear here.</p>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="border border-[#E5E7EB] rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-[#1A1A1A]">Event Settings</h4>
        {['Allow public registration', 'Enable survey after check-in', 'Notify members on new upload', 'Auto-archive after event ends'].map(s => (
          <div key={s} className="flex items-center justify-between">
            <span className="text-sm text-[#4B5563]">{s}</span>
            <Toggle />
          </div>
        ))}
      </div>
      <div className="border border-red-100 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h4>
        <button className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">Archive Event</button>
      </div>
    </div>
  );
}

function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-[#FF6115]' : 'bg-[#D1D5DB]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}
