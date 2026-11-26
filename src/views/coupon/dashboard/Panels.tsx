import { Icon } from '@iconify/react';
import { claimLimit } from '../../../data/coupons';
import { EXPIRING_DAYS, LOW_RATE_MIN_CLAIMS, LOW_REDEMPTION_RATE, LOW_STOCK_SHARE, type Alerts, type CouponRow } from './metrics';
import { useCouponFormat } from '../format';
import { useT } from '@/i18n';

// Status tokens (existing): warning amber, critical red. Always shown with an icon and a label.
// Healthy stock is neutral gray: orange already means "redemptions" in the charts beside it.
const STATUS = {
  ok: { fill: 'bg-[#6B7280]', track: 'bg-[#F3F4F6]', text: '', badge: '' },
  warning: { fill: 'bg-[#D97706]', track: 'bg-[#FEF3C7]', text: 'text-[#B45309]', badge: 'bg-[#FFFBEB] text-[#B45309]' },
  critical: { fill: 'bg-[#DC2626]', track: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', badge: 'bg-[#FEF2F2] text-[#B91C1C]' },
};

// Stock remaining per coupon, lowest first; under 10% is flagged.
export function StockList({ rows, onOpenCoupon }: { rows: CouponRow[]; onOpenCoupon: (id: string) => void }) {
  const t = useT();
  const fmt = useCouponFormat();
  const sorted = [...rows].sort((a, b) => a.remainingShare - b.remainingShare || a.coupon.title.localeCompare(b.coupon.title, 'th'));
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {sorted.map((r) => {
        const level = r.remaining === 0 ? 'critical' : r.remainingShare < LOW_STOCK_SHARE ? 'warning' : 'ok';
        const s = STATUS[level];
        return (
          <li key={r.coupon.id} className={`rounded-xl border p-3 flex flex-col ${level === 'warning' ? 'bg-[#FFFBEB] border-[#FDE68A]' : level === 'critical' ? 'bg-[#FEF2F2] border-[#FECACA]' : 'border-[#E5E7EB]'}`}>
            <button type="button" onClick={() => onOpenCoupon(r.coupon.id)} className="min-w-0 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 rounded">
              <span className="block text-sm font-medium text-[#1A1A1A] truncate group-hover:text-[#FF6115]">{r.coupon.title}</span>
              <span className="block text-xs text-[#6B7280] truncate">{r.brand?.name}</span>
            </button>
            <div className="mt-auto pt-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm text-[#1A1A1A] tabular-nums">
                  <span className="text-lg font-semibold">{fmt.number(r.remaining)}</span>
                  <span className="text-[#6B7280]"> / {fmt.number(claimLimit(r.coupon))}</span>
                </p>
                {level !== 'ok' ? (
                  <p className={`inline-flex items-center gap-1 text-xs font-medium ${s.text}`}>
                    <Icon icon={level === 'critical' ? 'solar:danger-circle-linear' : 'solar:danger-triangle-linear'} width={13} height={13} />
                    {level === 'critical' ? t('Out of stock') : t('Low stock · {share} left', { share: fmt.percent(r.remainingShare) })}
                  </p>
                ) : (
                  <p className="text-xs text-[#6B7280] tabular-nums">{t('{share} left', { share: fmt.percent(r.remainingShare) })}</p>
                )}
              </div>
              <div
                role="meter"
                aria-label={t('{name}: remaining stock', { name: r.coupon.title })}
                aria-valuemin={0}
                aria-valuemax={claimLimit(r.coupon)}
                aria-valuenow={r.remaining}
                className={`mt-2 h-1.5 rounded-full overflow-hidden ${level === 'ok' ? 'bg-[#F3F4F6]' : 'bg-white'}`}
              >
                <div className={`h-full rounded-full ${s.fill}`} style={{ width: `${r.remainingShare * 100}%` }} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// What needs attention now: expiring soon, sold out, brands whose claims aren't turning into visits.
export function AlertsPanel({ alerts, onOpenCoupon }: { alerts: Alerts; onOpenCoupon: (id: string) => void }) {
  const t = useT();
  const fmt = useCouponFormat();
  const total = alerts.expiring.length + alerts.outOfStock.length + alerts.lowRateBrands.length;
  const daysUntil = (iso: string) => Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));

  if (!total) {
    return (
      <p className="flex items-center gap-2 text-sm text-[#15803D]">
        <Icon icon="solar:check-circle-linear" width={18} height={18} className="flex-shrink-0" />
        {t('Nothing needs attention right now.')}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <AlertGroup level="warning" icon="solar:clock-circle-linear" title={t('Expiring within {days} days', { days: EXPIRING_DAYS })} count={alerts.expiring.length}>
        {alerts.expiring.map((r) => (
          <AlertItem
            key={r.coupon.id}
            title={r.coupon.title}
            detail={t('{brand} · expires {date} (in {days} days) · {count} left', { brand: r.brand?.name ?? '', date: fmt.dateTime(r.coupon.expiresAt), days: daysUntil(r.coupon.expiresAt), count: fmt.number(r.remaining) })}
            onClick={() => onOpenCoupon(r.coupon.id)}
          />
        ))}
      </AlertGroup>
      <AlertGroup level="critical" icon="solar:danger-circle-linear" title={t('Out of stock')} count={alerts.outOfStock.length}>
        {alerts.outOfStock.map((r) => (
          <AlertItem
            key={r.coupon.id}
            title={r.coupon.title}
            detail={t('{brand} · all {count} claimed', { brand: r.brand?.name ?? '', count: fmt.number(claimLimit(r.coupon)) })}
            onClick={() => onOpenCoupon(r.coupon.id)}
          />
        ))}
      </AlertGroup>
      <AlertGroup
        level="warning"
        icon="solar:graph-down-linear"
        title={t('Low redemption rate (under {rate})', { rate: fmt.percent(LOW_REDEMPTION_RATE) })}
        hint={t('Partners with at least {count} claims in the selected dates.', { count: LOW_RATE_MIN_CLAIMS })}
        count={alerts.lowRateBrands.length}
      >
        {alerts.lowRateBrands.map((s) => (
          <AlertItem key={s.brand.id} title={s.brand.name} detail={t('{rate} redeemed · {redeemed} of {claimed} claims', { rate: fmt.percent(s.rate), redeemed: fmt.number(s.redeemed), claimed: fmt.number(s.claimed) })} />
        ))}
      </AlertGroup>
    </div>
  );
}

function AlertGroup({ level, icon, title, hint, count, children }: { level: 'warning' | 'critical'; icon: string; title: string; hint?: string; count: number; children: React.ReactNode }) {
  const t = useT();
  const s = STATUS[level];
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
        <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${s.badge}`}>
          <Icon icon={icon} width={14} height={14} />
        </span>
        <span className="min-w-0">{title}</span>
        <span className={`ml-auto h-5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${count ? s.badge : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>{count}</span>
      </h3>
      {hint && <p className="mt-0.5 pl-8 text-xs text-[#9CA3AF]">{hint}</p>}
      {count ? <ul className="mt-2 pl-8 space-y-2">{children}</ul> : <p className="mt-1 pl-8 text-xs text-[#9CA3AF]">{t('None')}</p>}
    </section>
  );
}

function AlertItem({ title, detail, onClick }: { title: string; detail: string; onClick?: () => void }) {
  const body = (
    <>
      <span className={`block text-sm font-medium text-[#1A1A1A] truncate ${onClick ? 'group-hover:text-[#FF6115]' : ''}`}>{title}</span>
      <span className="block text-xs text-[#6B7280]">{detail}</span>
    </>
  );
  return (
    <li>
      {onClick ? (
        <button type="button" onClick={onClick} className="group text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 rounded">
          {body}
        </button>
      ) : (
        body
      )}
    </li>
  );
}
