import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import { claimLimit } from '../../../data/coupons';
import { downloadCsv, fileSlug, toCsv, type CouponRow } from './metrics';
import { toLocalParts, useCouponFormat } from '../format';
import { useT } from '@/i18n';

type SortKey = 'title' | 'brand' | 'claimed' | 'redeemed' | 'rate' | 'remaining' | 'expiresAt';
type Sort = { key: SortKey; dir: 'asc' | 'desc' };

const VALUE: Record<SortKey, (r: CouponRow) => string | number> = {
  title: (r) => r.coupon.title,
  brand: (r) => r.brand?.name ?? '',
  claimed: (r) => r.claimed,
  redeemed: (r) => r.redeemed,
  rate: (r) => r.rate,
  remaining: (r) => r.remaining,
  expiresAt: (r) => r.coupon.expiresAt,
};

interface PerformanceTableProps {
  rows: CouponRow[];
  phaseName: string;
  /** Local 'YYYY-MM-DD', for the file name. */
  start: string;
  end: string;
  onOpenCoupon: (id: string) => void;
}

// Per-coupon performance: sortable columns, export what's shown (in the shown order) as CSV.
export default function PerformanceTable({ rows, phaseName, start, end, onOpenCoupon }: PerformanceTableProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const [sort, setSort] = useState<Sort>({ key: 'redeemed', dir: 'desc' });
  const now = new Date().toISOString();

  const sorted = useMemo(() => {
    const get = VALUE[sort.key];
    return [...rows].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'th');
      return sort.dir === 'asc' ? c : -c;
    });
  }, [rows, sort]);

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'title' || key === 'brand' || key === 'expiresAt' ? 'asc' : 'desc' }));

  const exportCsv = () => {
    const csv = toCsv(
      ['Coupon ID', 'Coupon', 'Partner', 'Claimed', 'Redeemed', 'Redemption rate (%)', 'Remaining', 'Total quantity', 'Expires'],
      sorted.map((r) => [
        r.coupon.id,
        r.coupon.title,
        r.brand?.name ?? '',
        r.claimed,
        r.redeemed,
        Math.round(r.rate * 1000) / 10,
        r.remaining,
        claimLimit(r.coupon),
        `${toLocalParts(r.coupon.expiresAt).date} ${toLocalParts(r.coupon.expiresAt).time}`,
      ]),
    );
    downloadCsv(`coupon-performance_${fileSlug(phaseName, 'phase')}_${start}_${end}.csv`, csv);
  };

  const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
    { key: 'title', label: t('Coupon') },
    { key: 'brand', label: t('Partner') },
    { key: 'claimed', label: t('Claimed'), numeric: true },
    { key: 'redeemed', label: t('Redeemed'), numeric: true },
    { key: 'rate', label: t('Redemption rate'), numeric: true },
    { key: 'remaining', label: t('Remaining'), numeric: true },
    { key: 'expiresAt', label: t('Expires') },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#6B7280]">{t('Claimed and redeemed count the selected dates. Remaining is as of now.')}</p>
        <Button variant="secondary" pill icon="solar:download-minimalistic-linear" onClick={exportCsv} disabled={!rows.length} className="whitespace-nowrap flex-shrink-0">
          {t('Export CSV')}
        </Button>
      </div>
      <div className="mt-3 overflow-x-auto border-b border-[#E5E7EB]">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-y border-[#E5E7EB] text-xs font-medium text-[#374151]">
              {columns.map((c, i) => {
                const active = sort.key === c.key;
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={`h-11 ${i === 0 ? 'pl-4' : ''} px-3 ${c.numeric ? 'text-right' : 'text-left'}`}>
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className={`inline-flex items-center gap-1 rounded hover:text-[#FF6115] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${c.numeric ? 'flex-row-reverse' : ''} ${active ? 'text-[#1A1A1A] font-semibold' : ''}`}
                    >
                      {c.label}
                      <Icon
                        icon={active ? (sort.dir === 'asc' ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear') : 'solar:sort-vertical-linear'}
                        width={13}
                        height={13}
                        className={active ? 'text-[#FF6115]' : 'text-[#C4C8CF]'}
                        aria-hidden="true"
                      />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0] text-[13px] text-[#374151]">
            {sorted.map((r) => {
              const expired = r.coupon.expiresAt <= now;
              return (
                <tr key={r.coupon.id} className="hover:bg-[#FAFAFA]">
                  <td className="pl-4 px-3 py-3 max-w-[280px]">
                    <button type="button" onClick={() => onOpenCoupon(r.coupon.id)} className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline break-words">
                      {r.coupon.title}
                    </button>
                  </td>
                  <td className="px-3">{r.brand?.name}</td>
                  <td className="px-3 text-right tabular-nums">{fmt.number(r.claimed)}</td>
                  <td className="px-3 text-right tabular-nums">{fmt.number(r.redeemed)}</td>
                  <td className="px-3 text-right tabular-nums">{r.claimed ? fmt.percent(r.rate) : '—'}</td>
                  <td className="px-3 text-right tabular-nums whitespace-nowrap">
                    {fmt.number(r.remaining)} <span className="text-[#9CA3AF]">/ {fmt.number(claimLimit(r.coupon))}</span>
                  </td>
                  <td className={`px-3 whitespace-nowrap ${expired ? 'text-[#B45309]' : ''}`}>
                    {fmt.date(r.coupon.expiresAt)}
                    {expired && <span className="block text-xs">{t('Expired')}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
