import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../components/ui/Button';
import FilterSelect from '../../../components/ui/FilterSelect';
import { type Brand, type Coupon, type Phase, type Redemption } from '../../../data/coupons';
import { couponApi } from '../../../data/mock/couponApi';
import { ClaimsChart } from '../dashboard/Charts';
import { dailySeries } from '../dashboard/metrics';
import PhaseStatusBadge from '../phases/PhaseStatusBadge';
import { toLocalParts, useCouponFormat } from '../format';
import { partnerStats, type PartnerStats } from './partnerExport';
import { useT } from '@/i18n';

const ALL = 'all';
const NONE = 'none';
const DAY = 86_400_000;

const localDate = (iso: string) => toLocalParts(iso).date;
const today = () => localDate(new Date().toISOString());

/** The chart's days: the phase start → today (or its end, once over); for all phases, the last 30 days. */
function chartRange(phase: Phase | undefined): { start: string; end: string } {
  if (!phase) return { start: localDate(new Date(Date.now() - 29 * DAY).toISOString()), end: today() };
  const start = localDate(phase.startDate);
  const end = localDate(phase.endDate);
  return { start, end: today() < start ? end : today() < end ? today() : end };
}

interface BrandUsageProps {
  brand: Brand;
  /** This partner's coupons, every phase. */
  coupons: Coupon[];
  phases: Phase[];
}

// Usage data: how the partner's coupons perform — the viewer → claim → redeem funnel, claims over time,
// and the numbers per phase and per coupon. Loaded on demand (the chart library is heavy).
export default function BrandUsage({ brand, coupons, phases }: BrandUsageProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const [scope, setScope] = useState(ALL);
  const [records, setRecords] = useState<Redemption[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    // ISO strings sort by time, so this range covers every record.
    couponApi.redemptions
      .list({ from: '0000', to: '9999', brandId: brand.id })
      .then(setRecords)
      .catch(() => setError(true));
  }, [brand.id]);
  useEffect(load, [load]);

  // Phases this partner has coupons in, newest first.
  const ownPhases = useMemo(() => phases.filter((p) => coupons.some((c) => c.phaseId === p.id)).sort((a, b) => b.startDate.localeCompare(a.startDate)), [phases, coupons]);
  const unphased = coupons.filter((c) => !c.phaseId);
  const inScope = (c: Coupon) => scope === ALL || (scope === NONE ? !c.phaseId : c.phaseId === scope);
  const scoped = coupons.filter(inScope);
  const phase = phases.find((p) => p.id === scope);
  const s = partnerStats(scoped);
  const range = chartRange(phase);
  const daily = useMemo(() => {
    if (!records) return [];
    const ids = new Set(scoped.map((c) => c.id));
    return dailySeries(records.filter((r) => ids.has(r.couponId)), range.start, range.end);
    // `scoped` follows `scope` and `coupons`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, scope, coupons, range.start, range.end]);

  const scopeOptions = [
    { value: ALL, label: t('All campaigns') },
    ...ownPhases.map((p) => ({ value: p.id, label: p.name })),
    ...(unphased.length ? [{ value: NONE, label: t('Not in a campaign') }] : []),
  ];
  const scopeLabel = scopeOptions.find((o) => o.value === scope)?.label ?? scopeOptions[0].label;
  const rate = (part: number, whole: number) => (whole ? fmt.percent(Math.min(1, part / whole)) : '—');

  if (!coupons.length) {
    return (
      <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-10 text-center">
        <p className="text-sm font-semibold text-[#1A1A1A]">{t('No usage data yet')}</p>
        <p className="mt-1 text-sm text-[#6B7280]">{t('Numbers show here once {name} has coupons in the app.', { name: brand.name })}</p>
      </section>
    );
  }

  const phaseRows: { key: string; phase?: Phase; stats: PartnerStats }[] = [
    ...ownPhases.map((p) => ({ key: p.id, phase: p, stats: partnerStats(coupons.filter((c) => c.phaseId === p.id)) })),
    ...(unphased.length ? [{ key: NONE, stats: partnerStats(unphased) }] : []),
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">{t('Coupon usage')}</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {phase
                ? t('{phase}: {start} – {end}. Totals are as of now.', { phase: phase.name, start: fmt.date(phase.startDate), end: fmt.date(phase.endDate) })
                : t('All time, across {count} coupons. Totals are as of now.', { count: scoped.length })}
            </p>
          </div>
          <FilterSelect label={t('Campaign')} value={scopeLabel} options={scopeOptions.map((o) => o.label)} onChange={(v) => setScope(scopeOptions.find((o) => o.label === v)?.value ?? ALL)} />
        </div>

        <dl className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <Stat label={t('Views')} value={fmt.number(s.views)} />
          <Stat label={t('Unique viewers')} value={fmt.number(s.viewers)} />
          <Stat label={t('Claimed')} value={fmt.number(s.claimed)} sub={t('of {total}', { total: fmt.number(s.total) })} />
          <Stat label={t('Redeemed')} value={fmt.number(s.redeemed)} />
          <Stat label={t('Redemption rate')} value={rate(s.redeemed, s.claimed)} sub={t('of claimed')} />
          <Stat label={t('Remaining')} value={fmt.number(s.remaining)} />
        </dl>

        {/* Funnel: each bar is a share of the viewers. */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-[#1A1A1A]">{t('From viewing to redeeming')}</h3>
          <ol className="mt-3 space-y-2.5">
            {[
              { label: t('Viewed'), value: s.viewers, share: 1 },
              { label: t('Claimed'), value: s.claimed, share: s.viewers ? s.claimed / s.viewers : 0 },
              { label: t('Redeemed'), value: s.redeemed, share: s.viewers ? s.redeemed / s.viewers : 0 },
            ].map((step) => (
              <li key={step.label} className="grid grid-cols-[88px_minmax(0,1fr)_120px] items-center gap-3 text-sm">
                <span className="text-[#6B7280]">{step.label}</span>
                <span className="h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                  <span className="block h-full rounded-full bg-[#FF6115]" style={{ width: `${Math.min(100, step.share * 100)}%` }} />
                </span>
                <span className="text-right tabular-nums">
                  <span className="font-semibold text-[#1A1A1A]">{fmt.number(step.value)}</span>
                  <span className="text-xs text-[#9CA3AF]"> · {s.viewers ? fmt.percent(Math.min(1, step.share)) : '—'}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6 min-w-0">
        <h2 className="text-[15px] font-semibold text-[#1A1A1A]">{t('Claims and redemptions over time')}</h2>
        <p className="text-xs text-[#6B7280] mt-0.5 mb-4">
          {t('Per day, {start} – {end}.', { start: fmt.date(`${range.start}T12:00:00`), end: fmt.date(`${range.end}T12:00:00`) })}
        </p>
        {error ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            <span className="flex-1">{t('Couldn’t load the usage data. Check your connection and try again.')}</span>
            <Button variant="secondary" icon="solar:refresh-linear" onClick={load}>
              {t('Retry')}
            </Button>
          </div>
        ) : !records ? (
          <div role="status" aria-label={t('Loading')} className="h-64 rounded-xl bg-[#F3F4F6] animate-pulse" />
        ) : (
          <ClaimsChart data={daily} />
        )}
      </section>

      <section aria-labelledby="usage-by-phase" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6">
        <h2 id="usage-by-phase" className="text-[15px] font-semibold text-[#1A1A1A]">
          {t('By campaign')}
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">{t('Select a row to see that campaign above and below.')}</p>
        <UsageTable
          first={t('Campaign')}
          rows={phaseRows.map((r) => ({
            key: r.key,
            selected: scope === r.key,
            onSelect: () => setScope(r.key),
            name: r.phase ? r.phase.name : t('Not in a campaign'),
            detail: r.phase ? (
              <span className="inline-flex items-center gap-2">
                <PhaseStatusBadge status={r.phase.status} />
                {fmt.date(r.phase.startDate)} – {fmt.date(r.phase.endDate)}
              </span>
            ) : (
              t('Not shown in the app')
            ),
            stats: r.stats,
          }))}
        />
      </section>

      <section aria-labelledby="usage-by-coupon" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6">
        <h2 id="usage-by-coupon" className="text-[15px] font-semibold text-[#1A1A1A]">
          {t('By coupon')}
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">{scopeLabel}</p>
        <UsageTable
          first={t('Coupon')}
          rows={[...scoped]
            .sort((a, b) => b.claimedCount - a.claimedCount || a.title.localeCompare(b.title, 'th'))
            .map((c) => ({ key: c.id, name: c.title, detail: t('Expires {date}', { date: fmt.date(c.expiresAt) }), stats: partnerStats([c]) }))}
        />
      </section>
    </div>
  );
}

interface UsageRow {
  key: string;
  name: string;
  detail: React.ReactNode;
  stats: PartnerStats;
  selected?: boolean;
  onSelect?: () => void;
}

function UsageTable({ first, rows }: { first: string; rows: UsageRow[] }) {
  const t = useT();
  const fmt = useCouponFormat();
  const numeric = ['Views', 'Unique viewers', 'Claimed', 'Redeemed', 'Redemption rate', 'Remaining'];
  return (
    <div className="mt-4 overflow-x-auto border-b border-[#E5E7EB]">
      <table className="w-full min-w-[860px]">
        <thead>
          <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
            <th scope="col" className="h-11 pl-4 px-3">{first}</th>
            {numeric.map((h, i) => (
              <th key={h} scope="col" className={`px-3 text-right ${i === numeric.length - 1 ? 'pr-4' : ''}`}>
                {t(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F0F0] text-[13px] text-[#374151]">
          {rows.map((r) => (
            <tr key={r.key} className={r.selected ? 'bg-[#FFFAF7]' : 'hover:bg-[#FAFAFA]'}>
              <td className="pl-4 px-3 py-3 max-w-[320px]">
                {r.onSelect ? (
                  <button type="button" onClick={r.onSelect} className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline break-words">
                    {r.name}
                  </button>
                ) : (
                  <span className="text-sm font-medium text-[#1A1A1A] break-words">{r.name}</span>
                )}
                <span className="block mt-0.5 text-xs text-[#6B7280]">{r.detail}</span>
              </td>
              <td className="px-3 text-right tabular-nums">{fmt.number(r.stats.views)}</td>
              <td className="px-3 text-right tabular-nums">{fmt.number(r.stats.viewers)}</td>
              <td className="px-3 text-right tabular-nums whitespace-nowrap">
                {fmt.number(r.stats.claimed)} <span className="text-[#9CA3AF]">/ {fmt.number(r.stats.total)}</span>
              </td>
              <td className="px-3 text-right tabular-nums">{fmt.number(r.stats.redeemed)}</td>
              <td className="px-3 text-right tabular-nums">{r.stats.claimed ? `${fmt.number(r.stats.ratePct)}%` : '—'}</td>
              <td className="px-3 pr-4 text-right tabular-nums">{fmt.number(r.stats.remaining)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5">
      <dt className="text-xs font-medium text-[#6B7280]">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold text-[#1A1A1A] leading-tight">{value}</dd>
      {sub && <dd className="text-xs text-[#9CA3AF]">{sub}</dd>}
    </div>
  );
}
