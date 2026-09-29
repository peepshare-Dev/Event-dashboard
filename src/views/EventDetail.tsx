import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { Event } from '../data/mock';
import MembersAccess from './MembersAccess';
import RegistrationData from './RegistrationData';
import SurveyFeedback from './SurveyFeedback';
import { mockCollections, SHARING_COLORS } from './Collections';

const ALL_TABS = ['Overview', 'Registration', 'Survey', 'Collections', 'Members & Access'] as const;
type Tab = typeof ALL_TABS[number];

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
  visibleTabs?: readonly Tab[];
}

export default function EventDetail({ event, onBack, visibleTabs = ALL_TABS }: EventDetailProps) {
  const [tab, setTab] = useState<Tab>(visibleTabs[0]);

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
          <button className="flex-1 lg:flex-none px-4 py-2 text-sm bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors font-medium">Export Report</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Registered', value: event.registrants.toLocaleString(), icon: 'solar:users-group-rounded-linear', color: 'text-blue-600' },
          { label: 'Checked-in', value: event.checkedIn.toLocaleString(), icon: 'solar:check-circle-linear', color: 'text-green-600' },
          { label: 'Survey Responses', value: event.surveyResponses.toLocaleString(), icon: 'solar:chart-2-linear', color: 'text-purple-600' },
          { label: 'Photos', value: event.photos.toLocaleString(), icon: 'solar:gallery-linear', color: 'text-[#FF6115]' },
          { label: 'Members', value: event.members.toString(), icon: 'solar:user-id-linear', color: 'text-[#1A1A1A]' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <Icon icon={c.icon} width={22} height={22} className={`mb-1 ${c.color}`} />
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-4 flex gap-1 overflow-x-auto">
          {visibleTabs.map(t => (
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
          {tab === 'Registration' && <RegistrationData inEvent eventId={event.id} />}
          {tab === 'Survey' && <SurveyFeedback inEvent eventId={event.id} />}
          {tab === 'Collections' && <CollectionsTab event={event} />}
          {tab === 'Members & Access' && <MembersAccess />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ event }: { event: Event }) {
  const attendanceRate = event.registrants > 0 ? Math.round((event.checkedIn / event.registrants) * 100) : 0;
  const surveyRate = event.checkedIn > 0 ? Math.round((event.surveyResponses / event.checkedIn) * 100) : 0;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Registration breakdown */}
        <ReportSection title="Registration" subtitle={`${event.registrants.toLocaleString()} total registrants`}>
          <ProgressRow label="General" value={Math.round(event.registrants * 0.72)} total={event.registrants} />
          <ProgressRow label="VIP" value={Math.round(event.registrants * 0.28)} total={event.registrants} />
          <div className="pt-2 border-t border-[#F3F4F6] flex justify-between text-xs">
            <span className="text-[#6B7280]">Attendance Rate</span>
            <span className="font-semibold text-[#FF6115]">{attendanceRate}%</span>
          </div>
        </ReportSection>

        {/* Survey breakdown */}
        <ReportSection title="Survey" subtitle={`${event.surveyResponses.toLocaleString()} responses collected`}>
          <ProgressRow label="Responded" value={event.surveyResponses} total={event.checkedIn || 1} />
          <ProgressRow label="Did not respond" value={Math.max(0, event.checkedIn - event.surveyResponses)} total={event.checkedIn || 1} />
          <div className="pt-2 border-t border-[#F3F4F6] flex justify-between text-xs">
            <span className="text-[#6B7280]">Response Rate</span>
            <span className="font-semibold text-[#FF6115]">{surveyRate}%</span>
          </div>
        </ReportSection>

        {/* Photo Activity */}
        <ReportSection title="Photo Activity" subtitle={`${event.photos.toLocaleString()} total photos`}>
          <ProgressRow label="Completed" value={Math.round(event.photos * 0.99)} total={event.photos || 1} />
          <ProgressRow label="Processing" value={Math.round(event.photos * 0.007)} total={event.photos || 1} />
          <ProgressRow label="Failed" value={Math.max(0, event.photos - Math.round(event.photos * 0.99) - Math.round(event.photos * 0.007))} total={event.photos || 1} />
        </ReportSection>

        {/* Members */}
        <ReportSection title="Event Team" subtitle={`${event.members} members involved`}>
          {[
            { role: 'Event Admin', count: 2 },
            { role: 'Event Staff', count: 4 },
            { role: 'Photographer', count: 4 },
            { role: 'Viewer', count: event.members - 10 > 0 ? event.members - 10 : 2 },
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

function CollectionsTab({ event }: { event: Event }) {
  const eventCollections = mockCollections.filter(c => c.linkedEvent === event.name);
  const totalFiles = eventCollections.reduce((sum, c) => sum + c.files, 0);
  const totalStorage = eventCollections.reduce((sum, c) => sum + c.storageGb, 0);

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Collections', value: eventCollections.length.toString(), color: 'text-[#1A1A1A]' },
          { label: 'Total Files', value: totalFiles.toLocaleString(), color: 'text-blue-600' },
          { label: 'Total Storage', value: `${totalStorage.toFixed(1)} GB`, color: 'text-[#FF6115]' },
        ].map(c => (
          <div key={c.label} className="border border-[#E5E7EB] rounded-xl p-4">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {eventCollections.length === 0 ? (
        <div className="border border-[#E5E7EB] rounded-xl p-10 text-center">
          <Icon icon="solar:folder-linear" width={32} height={32} className="mx-auto text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#6B7280]">No collections linked to this event yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventCollections.map(c => (
            <div key={c.id} className="border border-[#E5E7EB] rounded-xl p-4">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:folder-linear" width={16} height={16} color="#FF6115" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[#1A1A1A] truncate">{c.name}</div>
                  <div className="text-xs text-[#9CA3AF] truncate">{c.description}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${SHARING_COLORS[c.sharing]}`}>
                  {c.sharing}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#4B5563]">
                <span>{c.files.toLocaleString()} files</span>
                <span>{c.storageGb >= 1 ? `${c.storageGb} GB` : `${Math.round(c.storageGb * 1000)} MB`}</span>
              </div>
              <div className="text-xs text-[#9CA3AF] mt-1.5">Updated {c.lastUpdated}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

