import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import SectionShell from './SectionShell';
import SelectField from '../../../components/set-event/form/SelectField';
import { ACTIVITY_ACTIONS, type ActivityAction, type EventActivity } from '../../../data/eventActivity';
import type { SetEvent } from '../../../data/setEvents';
import { useT } from '@/i18n';

const ACTION_STYLE: Record<ActivityAction, string> = {
  Created: 'bg-[#F0FDF4] text-[#15803D]',
  Edited: 'bg-[#EFF6FF] text-[#1D4ED8]',
  'Status changed': 'bg-[#FFF0E8] text-[#E5540F]',
  'Moved to Trash': 'bg-[#FEF2F2] text-[#DC2626]',
  Deleted: 'bg-[#FEF2F2] text-[#DC2626]',
};

const formatAt = (at: string) => {
  const [date, time] = at.split('T');
  const [y, m, d] = date.split('-');
  return { date: `${d}/${m}/${y}`, time };
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

interface EventActivityLogProps {
  event: SetEvent;
  /** This event's activity, any order. */
  activity: EventActivity[];
  onBack: () => void;
}

// Activity logs: who created / changed which field of this event, from what to what.
export default function EventActivityLog({ event, activity, onBack }: EventActivityLogProps) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<ActivityAction | 'all'>('all');
  const [user, setUser] = useState('all');

  const sorted = useMemo(() => [...activity].sort((a, b) => b.at.localeCompare(a.at)), [activity]);
  const people = useMemo(() => [...new Set(activity.map((a) => a.user))].sort(), [activity]);

  const q = search.trim().toLowerCase();
  const rows = sorted.filter(
    (a) =>
      (action === 'all' || a.action === action) &&
      (user === 'all' || a.user === user) &&
      (!q || [a.user, a.section, a.field, a.from, a.to].some((v) => v.toLowerCase().includes(q))),
  );
  const filtered = Boolean(q) || action !== 'all' || user !== 'all';

  return (
    <SectionShell event={event} title="Activity logs" onBack={onBack} flush>
      <div className="px-4 sm:px-6 pt-5 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold text-[#1A1A1A]">{t('Activity logs')}</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{t('Who created or changed this event, and what each field changed from and to.')}</p>
        </div>
        <p className="text-xs text-[#9CA3AF] flex-shrink-0">
          {t(activity.length === 1 ? '{shown} of {total} entry' : '{shown} of {total} entries', { shown: rows.length, total: activity.length })}
        </p>
      </div>

      <div className="px-4 sm:px-6 pb-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px_200px] gap-3">
        <div className="relative">
          <Icon icon="solar:magnifer-linear" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search field, value or user')}
            aria-label={t('Search activity')}
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
          />
        </div>
        <SelectField
          value={action}
          options={[{ value: 'all', label: t('All actions') }, ...ACTIVITY_ACTIONS.map((a) => ({ value: a, label: t(a) }))]}
          onChange={setAction}
          placeholder={t('Action')}
          icon="solar:pen-new-square-linear"
        />
        <SelectField
          value={user}
          options={[{ value: 'all', label: t('All users') }, ...people.map((p) => ({ value: p, label: p }))]}
          onChange={setUser}
          placeholder={t('User')}
          icon="solar:user-linear"
        />
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-[#F0F0F0] px-4 py-14 text-center">
          <Icon icon="solar:history-linear" width={28} height={28} className="mx-auto text-[#C4C8CF]" />
          <p className="mt-2 text-sm font-medium text-[#374151]">{filtered ? t('No activity matches your filters') : t('No activity yet')}</p>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setAction('all');
                setUser('all');
              }}
              className="mt-2 text-sm text-[#E5540F] hover:underline underline-offset-2"
            >
              {t('Clear filters')}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table (tablet & desktop) */}
          <div className="hidden md:block overflow-x-auto border-t border-[#F0F0F0]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-left text-xs font-semibold text-[#6B7280]">
                  <th className="px-4 sm:pl-6 py-3 whitespace-nowrap">{t('Date & Time')}</th>
                  <th className="px-4 py-3">{t('User')}</th>
                  <th className="px-4 py-3">{t('Action')}</th>
                  <th className="px-4 py-3">{t('Field')}</th>
                  <th className="px-4 py-3">{t('Old value')}</th>
                  <th className="px-4 sm:pr-6 py-3">{t('New value')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((a) => {
                  const { date, time } = formatAt(a.at);
                  return (
                    <tr key={a.id} className="align-top hover:bg-[#FAFAFA]">
                      <td className="px-4 sm:pl-6 py-3.5 whitespace-nowrap">
                        <p className="text-[#1A1A1A]">{date}</p>
                        <p className="text-xs text-[#9CA3AF]">{time}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <User name={a.user} />
                      </td>
                      <td className="px-4 py-3.5">
                        <ActionBadge action={a.action} />
                      </td>
                      <td className="px-4 py-3.5 min-w-[150px]">
                        {a.field ? (
                          <>
                            <p className="font-medium text-[#1A1A1A]">{t(a.field)}</p>
                            <p className="text-xs text-[#9CA3AF]">{t(a.section)}</p>
                          </>
                        ) : (
                          <span className="text-[#9CA3AF]">{t('Whole event')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-[240px]">
                        <Value value={a.from} old />
                      </td>
                      <td className="px-4 sm:pr-6 py-3.5 max-w-[240px]">
                        <Value value={a.to} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards (phones) */}
          <ul className="md:hidden border-t border-[#F0F0F0] divide-y divide-[#F3F4F6]">
            {rows.map((a) => {
              const { date, time } = formatAt(a.at);
              return (
                <li key={a.id} className="px-4 py-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <User name={a.user} />
                    <span className="text-xs text-[#9CA3AF] whitespace-nowrap">
                      {date} {time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActionBadge action={a.action} />
                    {a.field && (
                      <span className="text-sm font-medium text-[#1A1A1A]">
                        {t(a.field)} <span className="font-normal text-xs text-[#9CA3AF]">· {t(a.section)}</span>
                      </span>
                    )}
                  </div>
                  {(a.from || a.field) && (
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                      <span className="text-xs text-[#9CA3AF] pt-0.5">{t('Old')}</span>
                      <Value value={a.from} old />
                      <span className="text-xs text-[#9CA3AF] pt-0.5">{t('New')}</span>
                      <Value value={a.to} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </SectionShell>
  );
}

function User({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2 min-w-0">
      <span className="w-7 h-7 rounded-full bg-[#FFF0E8] text-[#E5540F] text-[10px] font-bold flex items-center justify-center flex-shrink-0">{initials(name)}</span>
      <span className="text-sm text-[#1A1A1A] whitespace-nowrap truncate">{name}</span>
    </span>
  );
}

function ActionBadge({ action }: { action: ActivityAction }) {
  const t = useT();
  return <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${ACTION_STYLE[action]}`}>{t(action)}</span>;
}

/** Old values are struck through; empty shows as "Not set". Long values clamp to 2 lines (full text on hover). */
function Value({ value, old }: { value: string; old?: boolean }) {
  const t = useT();
  if (!value) return <span className="text-[#C4C8CF] italic">{t('Not set')}</span>;
  return (
    <span title={value} className={`line-clamp-2 break-words ${old ? 'text-[#9CA3AF] line-through decoration-[#D1D5DB]' : 'text-[#1A1A1A]'}`}>
      {value}
    </span>
  );
}
