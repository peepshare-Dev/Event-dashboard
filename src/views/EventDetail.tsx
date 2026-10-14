import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useT } from '@/i18n';
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
  const t = useT();
  const [tab, setTab] = useState<Tab>(visibleTabs[0]);

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <button onClick={onBack} className="hover:text-[#FF6115] transition-colors">{t('Event List')}</button>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium truncate">{event.name}</span>
      </div>

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">{event.name}</h2>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>{t(event.status)}</span>
        </div>
        <p className="text-sm text-[#6B7280] mt-1">{event.dates} · {event.location}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {([
          { label: 'Registered', value: event.registrants.toLocaleString(), icon: 'solar:users-group-rounded-linear', color: 'text-blue-600' },
          {
            label: 'Checked-in',
            value: event.checkedIn.toLocaleString(),
            icon: 'solar:check-circle-linear',
            color: 'text-green-600',
            note: event.registrants > 0 ? t('{pct}% attendance', { pct: Math.round((event.checkedIn / event.registrants) * 100) }) : undefined,
          },
          { label: 'Survey Responses', value: event.surveyResponses.toLocaleString(), icon: 'solar:chart-2-linear', color: 'text-purple-600' },
          { label: 'Photos', value: event.photos.toLocaleString(), icon: 'solar:gallery-linear', color: 'text-[#FF6115]' },
          { label: 'Members', value: event.members.toString(), icon: 'solar:user-id-linear', color: 'text-[#1A1A1A]' },
        ] as { label: string; value: string; icon: string; color: string; note?: string }[]).map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <Icon icon={c.icon} width={22} height={22} className={`mb-1 ${c.color}`} />
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">
              {t(c.label)}
              {c.note && <span className="text-[#9CA3AF]"> · {c.note}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-4 flex gap-1 overflow-x-auto">
          {visibleTabs.map(name => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === name
                  ? 'border-[#FF6115] text-[#FF6115]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {t(name)}
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
  const t = useT();
  const attendanceRate = event.registrants > 0 ? Math.round((event.checkedIn / event.registrants) * 100) : 0;
  const surveyRate = event.checkedIn > 0 ? Math.round((event.surveyResponses / event.checkedIn) * 100) : 0;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Registration breakdown */}
        <ReportSection title={t('Registration')} subtitle={t('{count} total registrants', { count: event.registrants.toLocaleString() })}>
          <ProgressRow label={t('General')} value={Math.round(event.registrants * 0.72)} total={event.registrants} />
          <ProgressRow label={t('VIP')} value={Math.round(event.registrants * 0.28)} total={event.registrants} />
          <div className="pt-2 border-t border-[#F3F4F6] flex justify-between text-xs">
            <span className="text-[#6B7280]">{t('Attendance Rate')}</span>
            <span className="font-semibold text-[#FF6115]">{attendanceRate}%</span>
          </div>
        </ReportSection>

        {/* Survey breakdown */}
        <ReportSection title={t('Survey')} subtitle={t('{count} responses collected', { count: event.surveyResponses.toLocaleString() })}>
          <ProgressRow label={t('Responded')} value={event.surveyResponses} total={event.checkedIn || 1} />
          <ProgressRow label={t('Did not respond')} value={Math.max(0, event.checkedIn - event.surveyResponses)} total={event.checkedIn || 1} />
          <div className="pt-2 border-t border-[#F3F4F6] flex justify-between text-xs">
            <span className="text-[#6B7280]">{t('Response Rate')}</span>
            <span className="font-semibold text-[#FF6115]">{surveyRate}%</span>
          </div>
        </ReportSection>

        {/* Photo Activity */}
        <ReportSection title={t('Photo Activity')} subtitle={t('{count} total photos', { count: event.photos.toLocaleString() })}>
          <ProgressRow label={t('Completed')} value={Math.round(event.photos * 0.99)} total={event.photos || 1} />
          <ProgressRow label={t('Processing')} value={Math.round(event.photos * 0.007)} total={event.photos || 1} />
          <ProgressRow label={t('Failed')} value={Math.max(0, event.photos - Math.round(event.photos * 0.99) - Math.round(event.photos * 0.007))} total={event.photos || 1} />
        </ReportSection>

        {/* Members */}
        <ReportSection title={t('Event Team')} subtitle={t('{count} members involved', { count: event.members })}>
          {[
            { role: 'Event Admin', count: 2 },
            { role: 'Event Staff', count: 4 },
            { role: 'Photographer', count: 4 },
            { role: 'Viewer', count: event.members - 10 > 0 ? event.members - 10 : 2 },
          ].map(m => (
            <div key={m.role} className="flex justify-between py-1.5 text-sm border-b border-[#F3F4F6] last:border-0">
              <span className="text-[#6B7280]">{t(m.role)}</span>
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
  const t = useT();

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
            <div className="text-xs text-[#6B7280] mt-0.5">{t(c.label)}</div>
          </div>
        ))}
      </div>

      {eventCollections.length === 0 ? (
        <div className="border border-[#E5E7EB] rounded-xl p-10 text-center">
          <Icon icon="solar:folder-linear" width={32} height={32} className="mx-auto text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#6B7280]">{t('No collections linked to this event yet.')}</p>
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
                  {t(c.sharing)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#4B5563]">
                <span>{t('{count} files', { count: c.files.toLocaleString() })}</span>
                <span>{c.storageGb >= 1 ? `${c.storageGb} GB` : `${Math.round(c.storageGb * 1000)} MB`}</span>
              </div>
              <div className="text-xs text-[#9CA3AF] mt-1.5">{t('Updated {date}', { date: t(c.lastUpdated) })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

