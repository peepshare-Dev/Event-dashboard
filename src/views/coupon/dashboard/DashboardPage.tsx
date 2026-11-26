import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../../components/ui/PageHeader';
import FilterSelect from '../../../components/ui/FilterSelect';
import DateRangePicker from '../../../components/ui/DateRangePicker';
import Button from '../../../components/ui/Button';
import { PHASE_STATUS_LABELS, isPhaseLive, type Coupon, type Phase, type Redemption, type Brand } from '../../../data/coupons';
import { couponApi } from '../../../data/mock/couponApi';
import { couponsAcrossBrands, toLocalParts, useCouponFormat } from '../format';
import { alerts as buildAlerts, couponRows, kpis as buildKpis, rangeToIso, brandRows } from './metrics';
import { TopBrandsChart } from './Charts';
import { AlertsPanel, StockList } from './Panels';
import PerformanceTable from './PerformanceTable';
import { useT } from '@/i18n';

const PRESETS = ['Campaign to date', 'Last 7 days', 'Last 30 days', 'Custom'] as const;
type Preset = (typeof PRESETS)[number];
type Range = { start: string; end: string };

const today = () => toLocalParts(new Date().toISOString()).date;
const daysAgo = (n: number) => toLocalParts(new Date(Date.now() - n * 86_400_000).toISOString()).date;

/** Phase start → today, or the phase end if it's over (whole campaign if it hasn't started). */
function phaseRange(p: Phase): Range {
  const start = toLocalParts(p.startDate).date;
  const end = toLocalParts(p.endDate).date;
  const now = today();
  return { start, end: now < start ? end : now < end ? now : end };
}

function presetRange(preset: Preset, phase: Phase): Range {
  if (preset === 'Last 7 days') return { start: daysAgo(6), end: today() };
  if (preset === 'Last 30 days') return { start: daysAgo(29), end: today() };
  return phaseRange(phase);
}

/** The live phase, else the latest one that has started, else the first. */
function defaultPhase(phases: Phase[]): Phase | undefined {
  const now = new Date().toISOString();
  return phases.find((p) => isPhaseLive(p, now)) ?? [...phases].filter((p) => p.startDate <= now).sort((a, b) => b.startDate.localeCompare(a.startDate))[0] ?? phases[0];
}

interface DashboardPageProps {
  /** Opens a coupon on the Coupon list page; without an id, just the list. */
  onOpenCoupon: (id?: string) => void;
}

// Coupon dashboard: one filter row scopes every tile, chart, table and alert below it.
export default function DashboardPage({ onOpenCoupon }: DashboardPageProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [baseState, setBaseState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [phaseId, setPhaseId] = useState('');
  const [preset, setPreset] = useState<Preset>('Campaign to date');
  const [range, setRange] = useState<Range>({ start: '', end: '' });
  const [records, setRecords] = useState<Redemption[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const loadBase = useCallback(() => {
    setBaseState('loading');
    Promise.all([couponApi.phases.list(), couponApi.coupons.list(), couponApi.brands.list()])
      .then(([p, c, s]) => {
        setPhases(p);
        setCoupons(c);
        setBrands(s);
        const first = defaultPhase(p);
        if (first) {
          setPhaseId(first.id);
          setRange(phaseRange(first));
        }
        setBaseState('ready');
      })
      .catch(() => setBaseState('error'));
  }, []);
  useEffect(loadBase, [loadBase]);

  const phase = phases.find((p) => p.id === phaseId);
  const phaseCoupons = useMemo(() => coupons.filter((c) => c.phaseId === phaseId), [coupons, phaseId]);

  // Refetch keeps the previous numbers on screen (dimmed) instead of flashing a skeleton.
  const loadRecords = useCallback(() => {
    if (!phaseId || !range.start || !range.end) return;
    let cancelled = false;
    setFetching(true);
    setFetchError(false);
    couponApi.redemptions
      .list({ ...rangeToIso(range.start, range.end), phaseId })
      .then((r) => !cancelled && setRecords(r))
      .catch(() => !cancelled && setFetchError(true))
      .finally(() => !cancelled && setFetching(false));
    return () => {
      cancelled = true;
    };
  }, [phaseId, range]);
  useEffect(loadRecords, [loadRecords]);

  const pickPhase = (id: string) => {
    const next = phases.find((p) => p.id === id);
    if (!next) return;
    setPhaseId(id);
    setRange(presetRange(preset === 'Custom' ? 'Campaign to date' : preset, next));
    if (preset === 'Custom') setPreset('Campaign to date');
  };
  const pickPreset = (p: Preset) => {
    setPreset(p);
    if (p !== 'Custom' && phase) setRange(presetRange(p, phase));
  };

  const data = useMemo(() => {
    if (!records || !phase) return null;
    const rows = couponRows(phaseCoupons, brands, records, range.start, range.end);
    const byBrand = brandRows(rows);
    return { rows, byBrand, kpis: buildKpis(rows, phase), alerts: buildAlerts(rows, byBrand) };
  }, [records, phase, phaseCoupons, brands, range]);

  const phaseLabel = (p: Phase) => `${p.name} · ${t(PHASE_STATUS_LABELS[p.status])}`;
  const presetLabel = (p: Preset) => t(p);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 py-6">
        <PageHeader title={t('Dashboard')} icon="solar:chart-2-linear" description={t('Claims and redemptions across campaigns and partners.')} />

        {baseState === 'ready' && phase && (
          // One filter row, above everything it scopes.
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <FilterSelect label={t('Campaign')} value={phaseLabel(phase)} options={phases.map(phaseLabel)} onChange={(v) => pickPhase(phases.find((p) => phaseLabel(p) === v)?.id ?? phaseId)} />
            <FilterSelect label={t('Dates')} value={presetLabel(preset)} options={PRESETS.map(presetLabel)} onChange={(v) => pickPreset(PRESETS.find((p) => presetLabel(p) === v) ?? 'Campaign to date')} />
            <DateRangePicker
              start={range.start}
              end={range.end}
              onChange={(r) => {
                if (!r.start || !r.end) return;
                setPreset('Custom');
                setRange(r.start <= r.end ? r : { start: r.end, end: r.start });
              }}
            />
          </div>
        )}
      </div>

      {baseState === 'loading' ? (
        <div role="status" aria-label={t('Loading')} className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-[#E5E7EB] animate-pulse" />
          ))}
        </div>
      ) : baseState === 'error' || fetchError ? (
        <Card>
          <div className="py-10 flex flex-col items-center text-center">
            <p className="text-sm font-semibold text-[#1A1A1A]">{t('Couldn’t load the dashboard')}</p>
            <p className="text-sm text-[#6B7280] mt-1">{t('Something went wrong while loading. Check your connection and try again.')}</p>
            <Button variant="secondary" icon="solar:refresh-linear" onClick={baseState === 'error' ? loadBase : loadRecords} className="mt-4">
              {t('Retry')}
            </Button>
          </div>
        </Card>
      ) : !phase ? (
        <EmptyState title={t('No campaigns yet')} text={t('Create a campaign, then add coupons to it, to see results here.')} onOpenCoupon={onOpenCoupon} />
      ) : phaseCoupons.length === 0 ? (
        <EmptyState title={t('No coupons in {phase} yet', { phase: phase.name })} text={t('Add coupons to this campaign on the Coupon list, and their claims and redemptions will show here.')} onOpenCoupon={onOpenCoupon} />
      ) : data ? (
        <div aria-busy={fetching} className={`space-y-4 sm:space-y-6 transition-opacity ${fetching ? 'opacity-60' : ''}`}>
          <section aria-label={t('Key numbers')}>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              <Kpi icon="solar:ticket-sale-linear" label={t('Total coupons in campaign')} value={fmt.number(data.kpis.total)} sub={couponsAcrossBrands(t, data.kpis.couponCount, data.kpis.brandCount)} />
              <Kpi icon="solar:hand-money-linear" label={t('Claimed')} value={fmt.number(data.kpis.claimed)} sub={t('{share} of total', { share: fmt.percent(data.kpis.claimedShare) })} share={data.kpis.claimedShare} />
              <Kpi icon="solar:bag-check-linear" label={t('Redeemed')} value={fmt.number(data.kpis.redeemed)} sub={t('{rate} of claimed (redemption rate)', { rate: fmt.percent(data.kpis.redemptionRate) })} share={data.kpis.redemptionRate} />
              <Kpi icon="solar:box-linear" label={t('Remaining')} value={fmt.number(data.kpis.remaining)} sub={t('{share} of total, as of now', { share: fmt.percent(data.kpis.remainingShare) })} share={data.kpis.remainingShare} />
              <Kpi
                icon="solar:calendar-linear"
                label={t('Days left in campaign')}
                value={data.kpis.daysToStart > 0 ? '—' : data.kpis.daysLeft > 0 ? fmt.number(data.kpis.daysLeft) : t('Ended')}
                sub={
                  data.kpis.daysToStart > 0
                    ? t('Starts in {days} days', { days: data.kpis.daysToStart })
                    : data.kpis.daysLeft > 0
                      ? t('Ends {date}', { date: fmt.date(phase.endDate) })
                      : t('Ended {date}', { date: fmt.date(phase.endDate) })
                }
              />
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">
              {t('Claimed and redeemed count {start} – {end}. Total, remaining and days left are as of now.', {
                start: fmt.date(`${range.start}T12:00:00`),
                end: fmt.date(`${range.end}T12:00:00`),
              })}
            </p>
          </section>

          {/* Who's doing well (wide) beside what needs attention (narrow). */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            <Card title={t('Top partners by redemptions')} subtitle={t('Redemptions in the selected dates.')} className="xl:col-span-2">
              <TopBrandsChart rows={data.byBrand} />
            </Card>
            <Card title={t('Alerts')} subtitle={t('Coupons and partners that need attention.')}>
              <AlertsPanel alerts={data.alerts} onOpenCoupon={onOpenCoupon} />
            </Card>
          </div>

          <Card title={t('Stock remaining per coupon')} subtitle={t('Lowest first. Under 10% left is flagged.')}>
            <StockList rows={data.rows} onOpenCoupon={onOpenCoupon} />
          </Card>

          <Card title={t('Coupon performance')}>
            <PerformanceTable rows={data.rows} phaseName={phase.name} start={range.start} end={range.end} onOpenCoupon={onOpenCoupon} />
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Card({ title, subtitle, className = '', children }: { title?: string; subtitle?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6 min-w-0 ${className}`}>
      {title && (
        <header className="mb-4">
          <h2 className="text-[15px] font-semibold text-[#1A1A1A]">{title}</h2>
          {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

// Stat tile: icon + label · value · supporting line, and a thin bar when the value is a share of something.
function Kpi({ icon, label, value, sub, share }: { icon: string; label: string; value: string; sub: string; share?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 flex flex-col">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-[#FFF0E8] text-[#FF6115] flex items-center justify-center flex-shrink-0">
          <Icon icon={icon} width={18} height={18} />
        </span>
        <p className="text-xs font-medium text-[#6B7280] leading-snug">{label}</p>
      </div>
      <p className="mt-3 text-[26px] font-semibold text-[#1A1A1A] leading-tight tabular-nums">{value}</p>
      {share !== undefined && (
        <div aria-hidden="true" className="mt-2 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
          <div className="h-full rounded-full bg-[#FF6115]" style={{ width: `${Math.min(100, Math.max(0, share * 100))}%` }} />
        </div>
      )}
      <p className="mt-2 text-xs text-[#6B7280]">{sub}</p>
    </div>
  );
}

function EmptyState({ title, text, onOpenCoupon }: { title: string; text: string; onOpenCoupon: (id?: string) => void }) {
  const t = useT();
  return (
    <Card>
      <div className="py-12 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
          <Icon icon="solar:chart-2-linear" width={22} height={22} className="text-[#FF6115]" />
        </div>
        <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
        <p className="text-sm text-[#6B7280] mt-1 max-w-sm">{text}</p>
        <Button icon="solar:ticket-sale-linear" onClick={() => onOpenCoupon()} className="mt-4">
          {t('Go to Coupon list')}
        </Button>
      </div>
    </Card>
  );
}
