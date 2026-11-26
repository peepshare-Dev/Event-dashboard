import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import EventFormSection from '../../../components/set-event/form/EventFormSection';
import Button from '../../../components/ui/Button';
import type { Coupon, CouponView, Redemption } from '../../../data/coupons';
import { couponApi } from '../../../data/mock/couponApi';
import { downloadCsv, toCsv } from '../dashboard/metrics';
import { toLocalParts, useCouponFormat } from '../format';
import { useT } from '@/i18n';

const PAGE = 10;

interface ViewerRow {
  userId: string;
  views: number;
  firstViewedAt: string;
  lastViewedAt: string;
  claimedAt?: string;
  redeemedAt?: string;
}

/** One row per user, most recent viewer first. `views` comes newest first. */
function viewerRows(views: CouponView[], redemptions: Redemption[]): ViewerRow[] {
  const byUser = new Map<string, ViewerRow>();
  for (const v of views) {
    const row = byUser.get(v.userId);
    if (row) {
      row.views++;
      row.firstViewedAt = v.viewedAt;
    } else byUser.set(v.userId, { userId: v.userId, views: 1, firstViewedAt: v.viewedAt, lastViewedAt: v.viewedAt });
  }
  for (const r of redemptions) {
    const row = byUser.get(r.userId);
    if (row) Object.assign(row, { claimedAt: r.claimedAt, redeemedAt: r.redeemedAt });
  }
  return [...byUser.values()];
}

// Data Viewer: who opened this coupon's Coupon Detail screen in the app, and whether they went on to claim it.
export default function CouponViewersPanel({ coupon }: { coupon: Coupon }) {
  const t = useT();
  const fmt = useCouponFormat();
  const [rows, setRows] = useState<ViewerRow[] | null>(null);
  const [error, setError] = useState(false);
  const [shown, setShown] = useState(PAGE);

  const load = useCallback(() => {
    setError(false);
    // ISO strings sort by time, so this range covers every record.
    Promise.all([couponApi.views.list({ couponId: coupon.id }), couponApi.redemptions.list({ from: '0000', to: '9999', couponId: coupon.id })])
      .then(([v, r]) => setRows(viewerRows(v, r)))
      .catch(() => setError(true));
  }, [coupon.id]);
  useEffect(load, [load]);

  const claimedViewers = useMemo(() => rows?.filter((r) => r.claimedAt).length ?? 0, [rows]);

  const exportCsv = () => {
    if (!rows) return;
    const stamp = (iso?: string) => (iso ? `${toLocalParts(iso).date} ${toLocalParts(iso).time}` : '');
    const csv = toCsv(
      ['User ID', 'Views', 'First viewed', 'Last viewed', 'Claimed', 'Redeemed'],
      rows.map((r) => [r.userId, r.views, stamp(r.firstViewedAt), stamp(r.lastViewedAt), stamp(r.claimedAt), stamp(r.redeemedAt)]),
    );
    downloadCsv(`coupon-viewers_${coupon.id}.csv`, csv);
  };

  return (
    <EventFormSection
      id="coupon-viewers"
      icon="solar:eye-linear"
      title={t('Data Viewer')}
      description={t('Recorded each time a user opens this coupon’s detail screen in the app.')}
      actions={
        <Button variant="secondary" pill icon="solar:download-minimalistic-linear" onClick={exportCsv} disabled={!rows?.length} className="whitespace-nowrap">
          {t('Export CSV')}
        </Button>
      }
    >
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={t('Views')} value={fmt.number(coupon.viewCount)} />
        <Stat label={t('Unique viewers')} value={fmt.number(coupon.viewerCount)} />
        <Stat label={t('Claimed')} value={fmt.number(coupon.claimedCount)} />
        <Stat label={t('Viewer → claim')} value={coupon.viewerCount ? fmt.percent(Math.min(1, claimedViewers / coupon.viewerCount)) : '—'} />
      </dl>

      {error ? (
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          <span className="flex-1">{t('Couldn’t load the viewers. Check your connection and try again.')}</span>
          <Button variant="secondary" icon="solar:refresh-linear" onClick={load}>
            {t('Retry')}
          </Button>
        </div>
      ) : !rows ? (
        <div role="status" aria-label={t('Loading')} className="mt-5 h-40 rounded-xl bg-[#F3F4F6] animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="mt-5 py-10 text-center text-sm text-[#6B7280] border border-dashed border-[#E5E7EB] rounded-xl">{t('No one has opened this coupon in the app yet.')}</p>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto border-b border-[#E5E7EB]">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                  <th scope="col" className="h-11 pl-4 px-3">{t('User ID')}</th>
                  <th scope="col" className="px-3 text-right">{t('Views')}</th>
                  <th scope="col" className="px-3">{t('Last viewed')}</th>
                  <th scope="col" className="px-3 pr-4">{t('Claimed')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0] text-[13px] text-[#374151]">
                {rows.slice(0, shown).map((r) => (
                  <tr key={r.userId}>
                    <td className="pl-4 px-3 py-2.5 font-mono">{r.userId}</td>
                    <td className="px-3 text-right tabular-nums">{fmt.number(r.views)}</td>
                    <td className="px-3 whitespace-nowrap">{fmt.dateTime(r.lastViewedAt)}</td>
                    <td className="px-3 pr-4 whitespace-nowrap">
                      {r.claimedAt ? (
                        <span className="inline-flex items-center gap-1.5 text-[#15803D]">
                          <Icon icon="solar:check-circle-linear" width={16} height={16} />
                          {r.redeemedAt ? t('Claimed and redeemed') : t('Claimed')}
                        </span>
                      ) : (
                        <span className="text-[#9CA3AF]">{t('Viewed only')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
            <span>{t('Showing {count} of {total} viewers, most recent first.', { count: fmt.number(Math.min(shown, rows.length)), total: fmt.number(rows.length) })}</span>
            {shown < rows.length && (
              <button type="button" onClick={() => setShown((n) => n + PAGE * 2)} className="h-8 px-2 font-medium text-[#FF6115] hover:underline underline-offset-2">
                {t('Show more')}
              </button>
            )}
          </div>
        </>
      )}
    </EventFormSection>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5">
      <dt className="text-xs font-medium text-[#6B7280]">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold text-[#1A1A1A] leading-tight">{value}</dd>
    </div>
  );
}
