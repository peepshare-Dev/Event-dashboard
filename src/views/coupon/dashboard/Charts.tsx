import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyPoint, BrandRow } from './metrics';
import { useCouponFormat } from '../format';
import { useT } from '@/i18n';

// Series colours: existing tokens, validated as a pair (CVD ΔE 31.9, contrast ≥ 3:1 on white).
// Each series keeps its colour on every chart: claims blue, redemptions brand orange.
export const SERIES = { claims: '#2563EB', redemptions: '#FF6115' } as const;
const GRID = '#F0F0F0';
const AXIS = '#E5E7EB';
const TICK = { fill: '#6B7280', fontSize: 12 };
/** Within this share of the y-range, the two end labels would collide, so the legend carries identity alone. */
const END_LABEL_MIN_GAP = 0.08;

/** Short coloured stroke that keys a series in legends and tooltips. */
function LineKey({ color }: { color: string }) {
  return <span className="inline-block w-3 h-0.5 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />;
}

function TooltipCard({ title, rows }: { title: string; rows: { color?: string; value: string; label: string }[] }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-lg text-xs min-w-[140px]">
      <p className="text-[#6B7280] mb-1">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2 py-0.5">
          {r.color && <LineKey color={r.color} />}
          {/* Value leads, label follows. */}
          <span className="font-semibold text-[#1A1A1A] tabular-nums">{r.value}</span>
          <span className="text-[#6B7280]">{r.label}</span>
        </p>
      ))}
    </div>
  );
}

/** "View as table": every chart value is reachable without hovering. */
function TableView({ summary, head, rows }: { summary: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-3 group">
      <summary className="cursor-pointer select-none text-xs text-[#6B7280] hover:text-[#FF6115] w-fit">{summary}</summary>
      <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-[#F0F0F0]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#F9FAFB]">
            <tr>
              {head.map((h, i) => (
                <th key={h} scope="col" className={`px-3 py-2 font-medium text-[#374151] ${i ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {rows.map((r) => (
              <tr key={String(r[0])}>
                {r.map((c, i) => (
                  <td key={i} className={`px-3 py-1.5 text-[#374151] ${i ? 'text-right tabular-nums' : ''}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

// Daily claims and redemptions: two series on one axis, crosshair tooltip, legend plus end labels.
export function ClaimsChart({ data }: { data: DailyPoint[] }) {
  const t = useT();
  const fmt = useCouponFormat();
  const names = { claims: t('Claims'), redemptions: t('Redemptions') };
  const last = data[data.length - 1];
  const max = Math.max(1, ...data.flatMap((d) => [d.claims, d.redemptions]));
  const endLabels = Boolean(last) && Math.abs(last.claims - last.redemptions) / max >= END_LABEL_MIN_GAP;
  const dayIso = (date: string) => new Date(`${date}T12:00:00`).toISOString();

  const endLabel = (key: keyof typeof names) =>
    endLabels
      ? (p: { x?: number | string; y?: number | string; index?: number }) =>
          p.index === data.length - 1 ? (
            <text x={Number(p.x) + 8} y={Number(p.y) + 4} fontSize={12} fill="#374151">
              {names[key]}
            </text>
          ) : (
            <g />
          )
      : undefined;

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#374151]" aria-hidden="true">
        {(Object.keys(names) as (keyof typeof names)[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <LineKey color={SERIES[k]} />
            {names[k]}
          </span>
        ))}
      </div>
      <div className="mt-3 h-[280px]" role="figure" aria-label={t('Line chart of daily claims and redemptions. The same numbers are in the table below.')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: endLabels ? 88 : 16, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="date" tickFormatter={(d: string) => fmt.day(dayIso(d))} tick={TICK} tickLine={false} axisLine={{ stroke: AXIS }} minTickGap={28} />
            <YAxis allowDecimals={false} tickFormatter={(v: number) => fmt.number(v)} tick={TICK} tickLine={false} axisLine={false} width={36} />
            <Tooltip
              cursor={{ stroke: '#D1D5DB', strokeWidth: 1 }}
              isAnimationActive={false}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <TooltipCard
                    title={fmt.date(dayIso(String(label)))}
                    rows={(['claims', 'redemptions'] as const).map((k) => ({ color: SERIES[k], value: fmt.number(Number(payload.find((p) => p.dataKey === k)?.value ?? 0)), label: names[k] }))}
                  />
                ) : null
              }
            />
            {(['claims', 'redemptions'] as const).map((k) => (
              <Line
                key={k}
                type="linear"
                dataKey={k}
                name={names[k]}
                stroke={SERIES[k]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                dot={false}
                activeDot={{ r: 5, fill: SERIES[k], stroke: '#FFFFFF', strokeWidth: 2 }}
                label={endLabel(k)}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <TableView
        summary={t('View as table')}
        head={[t('Date'), names.claims, names.redemptions]}
        rows={data.map((d) => [fmt.date(dayIso(d.date)), fmt.number(d.claims), fmt.number(d.redemptions)])}
      />
    </div>
  );
}

// Top brands by redemptions: one series (so no legend), value at each bar's tip.
export function TopBrandsChart({ rows }: { rows: BrandRow[] }) {
  const t = useT();
  const fmt = useCouponFormat();
  const data = rows.map((r) => ({ name: r.brand.name, redeemed: r.redeemed, claimed: r.claimed, rate: r.rate }));
  return (
    <div>
      <div style={{ height: data.length * 44 + 8 }} role="figure" aria-label={t('Bar chart of redemptions per partner. The same numbers are in the table below.')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 0 }} barCategoryGap={10}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={128} tick={{ ...TICK, fill: '#374151' }} tickLine={false} axisLine={{ stroke: AXIS }} />
            <Tooltip
              cursor={{ fill: '#F9FAFB' }}
              isAnimationActive={false}
              content={({ active, payload }) => {
                const d = active ? payload?.[0]?.payload : null;
                return d ? (
                  <TooltipCard
                    title={d.name}
                    rows={[
                      { color: SERIES.redemptions, value: fmt.number(d.redeemed), label: t('Redemptions') },
                      { value: fmt.number(d.claimed), label: t('Claims') },
                      { value: fmt.percent(d.rate), label: t('Redemption rate') },
                    ]}
                  />
                ) : null;
              }}
            />
            <Bar dataKey="redeemed" fill={SERIES.redemptions} maxBarSize={24} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="redeemed" position="right" fill="#374151" fontSize={12} formatter={(v: unknown) => fmt.number(Number(v))} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <TableView
        summary={t('View as table')}
        head={[t('Partner'), t('Redemptions'), t('Claims'), t('Redemption rate')]}
        rows={data.map((d) => [d.name, fmt.number(d.redeemed), fmt.number(d.claimed), fmt.percent(d.rate)])}
      />
    </div>
  );
}
