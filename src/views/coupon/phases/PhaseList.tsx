import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import StatusTabs from '../../../components/ui/StatusTabs';
import { PHASE_STATUS_LABELS, phaseDurationDays, type Phase, type PhaseStatus } from '../../../data/coupons';
import { useCan } from '../CouponRoleContext';
import { useCouponFormat } from '../format';
import PhaseStatusBadge, { PHASE_STATUSES } from './PhaseStatusBadge';
import type { PhaseStats } from './stats';
import { useT } from '@/i18n';

type Filter = 'All' | PhaseStatus;

interface PhaseListProps {
  phases: Phase[];
  stats: Map<string, PhaseStats>;
  loadState: 'loading' | 'error' | 'ready';
  onRetry: () => void;
  onCreate: () => void;
  onOpen: (p: Phase) => void;
}

// Phases: newest first (or oldest), filter by status, table (cards on phones).
export default function PhaseList({ phases, stats, loadState, onRetry, onCreate, onOpen }: PhaseListProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const canEdit = useCan('phase.write');
  const [filter, setFilter] = useState<Filter>('All');
  const [newestFirst, setNewestFirst] = useState(true);

  const sorted = useMemo(
    () => [...phases].sort((a, b) => (newestFirst ? b.startDate.localeCompare(a.startDate) : a.startDate.localeCompare(b.startDate))),
    [phases, newestFirst],
  );
  const shown = filter === 'All' ? sorted : sorted.filter((p) => p.status === filter);
  const filters: Filter[] = ['All', ...PHASE_STATUSES];
  const counts = Object.fromEntries(filters.map((f) => [f, f === 'All' ? phases.length : phases.filter((p) => p.status === f).length])) as Record<Filter, number>;
  // StatusTabs shows (and translates) the label; map it back to the status.
  const labelOf = (f: Filter) => (f === 'All' ? 'All' : PHASE_STATUS_LABELS[f]);
  const days = (p: Phase) => phaseDurationDays(p.startDate, p.endDate);
  const dayLabel = (n: number) => (n === 1 ? t('1 day') : t('{count} days', { count: fmt.number(n) }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
        <PageHeader
          title={t('Campaigns')}
          icon="solar:calendar-linear"
          description={t('Campaign periods that coupons belong to.')}
          actions={
            canEdit && phases.length > 0 && (
              <Button pill icon="solar:add-linear" onClick={onCreate} className="whitespace-nowrap flex-1 sm:flex-none">
                {t('Create campaign')}
              </Button>
            )
          }
        />

        {loadState === 'loading' ? (
          <div role="status" aria-label={t('Loading campaigns')} className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl border border-[#F0F0F0] bg-[#F9FAFB] animate-pulse" />
            ))}
          </div>
        ) : loadState === 'error' ? (
          <StateBox icon="solar:cloud-cross-linear" title={t('Couldn’t load campaigns')} text={t('Something went wrong while loading. Check your connection and try again.')}>
            <Button variant="secondary" icon="solar:refresh-linear" onClick={onRetry}>
              {t('Retry')}
            </Button>
          </StateBox>
        ) : phases.length === 0 ? (
          <StateBox
            icon="solar:calendar-linear"
            title={t('No campaigns yet')}
            text={t('Campaigns group coupons by time period, e.g. “New Year 2027” from 1 Jan to 14 Feb. Create a campaign first, then add coupons to it.')}
          >
            {canEdit && (
              <Button icon="solar:add-linear" onClick={onCreate}>
                {t('Create campaign')}
              </Button>
            )}
          </StateBox>
        ) : (
          <>
            <StatusTabs
              tabs={filters.map(labelOf)}
              active={labelOf(filter)}
              counts={Object.fromEntries(filters.map((f) => [labelOf(f), counts[f]]))}
              onChange={(label) => setFilter(filters.find((f) => labelOf(f) === label) ?? 'All')}
              className="mt-5"
            />

            {shown.length === 0 ? (
              <StateBox icon="solar:magnifer-linear" title={t('No campaigns with this status')} text={t('Pick another status to see more campaigns.')}>
                <Button variant="secondary" onClick={() => setFilter('All')}>
                  {t('Show all campaigns')}
                </Button>
              </StateBox>
            ) : (
              <>
                {/* Desktop / tablet: table */}
                <div className="hidden md:block mt-4 overflow-x-auto border-b border-[#E5E7EB]">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                        <th scope="col" className="h-11 pl-4 px-3">{t('Campaign')}</th>
                        <th scope="col" className="px-3" aria-sort={newestFirst ? 'descending' : 'ascending'}>
                          <button type="button" onClick={() => setNewestFirst((v) => !v)} className="inline-flex items-center gap-1 rounded hover:text-[#FF6115] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40">
                            {t('Dates')}
                            <Icon icon={newestFirst ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-up-linear'} width={13} height={13} className="text-[#FF6115]" aria-hidden="true" />
                            <span className="sr-only">{newestFirst ? t('newest first') : t('oldest first')}</span>
                          </button>
                        </th>
                        <th scope="col" className="px-3 text-right">{t('Duration')}</th>
                        <th scope="col" className="px-3 text-right">{t('Partners')}</th>
                        <th scope="col" className="px-3 text-right">{t('Total coupons')}</th>
                        <th scope="col" className="px-3">{t('Claimed / total')}</th>
                        <th scope="col" className="px-3 pr-4">{t('Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F0F0] text-[13px] text-[#374151]">
                      {shown.map((p) => {
                        const s = stats.get(p.id)!;
                        return (
                          <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                            <td className="pl-4 px-3 py-3.5 max-w-[280px]">
                              <button type="button" onClick={() => onOpen(p)} className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline break-words">
                                {p.name}
                              </button>
                            </td>
                            <td className="px-3 whitespace-nowrap">
                              {fmt.date(p.startDate)} – {fmt.date(p.endDate)}
                            </td>
                            <td className="px-3 text-right tabular-nums whitespace-nowrap">{dayLabel(days(p))}</td>
                            <td className="px-3 text-right tabular-nums">{fmt.number(s.brandCount)}</td>
                            <td className="px-3 text-right tabular-nums">{fmt.number(s.total)}</td>
                            <td className="px-3">
                              <ClaimedBar claimed={s.claimed} total={s.total} />
                            </td>
                            <td className="px-3 pr-4">
                              <PhaseStatusBadge status={p.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards */}
                <ul className="md:hidden mt-4 space-y-3">
                  {shown.map((p) => {
                    const s = stats.get(p.id)!;
                    return (
                      <li key={p.id} className="rounded-xl border border-[#E5E7EB] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <button type="button" onClick={() => onOpen(p)} className="text-left text-sm font-semibold text-[#1A1A1A] hover:text-[#FF6115] break-words">
                            {p.name}
                          </button>
                          <PhaseStatusBadge status={p.status} />
                        </div>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {fmt.date(p.startDate)} – {fmt.date(p.endDate)} · {dayLabel(days(p))}
                        </p>
                        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs items-center">
                          <dt className="text-[#9CA3AF]">{t('Partners')}</dt>
                          <dd className="text-[#374151]">{fmt.number(s.brandCount)}</dd>
                          <dt className="text-[#9CA3AF]">{t('Claimed / total')}</dt>
                          <dd>
                            <ClaimedBar claimed={s.claimed} total={s.total} />
                          </dd>
                        </dl>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ClaimedBar({ claimed, total }: { claimed: number; total: number }) {
  const t = useT();
  const fmt = useCouponFormat();
  return (
    <div className="w-[140px]">
      <p className="text-[13px] text-[#374151] tabular-nums">
        <span className="font-medium text-[#1A1A1A]">{fmt.number(claimed)}</span> / {fmt.number(total)}
      </p>
      <div role="meter" aria-label={t('Claimed')} aria-valuemin={0} aria-valuemax={total} aria-valuenow={claimed} className="mt-1 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
        <div className="h-full rounded-full bg-[#FF6115]" style={{ width: `${total ? (claimed / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

export function StateBox({ icon, title, text, children }: { icon: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="mt-4 border border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
        <Icon icon={icon} width={22} height={22} className="text-[#FF6115]" />
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
      <p className="text-sm text-[#6B7280] mt-1 max-w-md">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
