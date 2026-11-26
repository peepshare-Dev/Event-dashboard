import { useId } from 'react';
import Toggle from '../../../components/ui/Toggle';
import { activationBlock, claimLimit, couponStatus, remainingStock, type Coupon, type Phase } from '../../../data/coupons';
import CouponStatusBadge from '../CouponStatusBadge';
import { useCan } from '../CouponRoleContext';
import { useCouponFormat } from '../format';
import { useT } from '@/i18n';

// Table cells shared by the Coupon list and a brand's Coupons tab.

/**
 * On/off switch plus the coupon's status. On is the default: the coupon goes Active by itself while its campaign runs,
 * so the switch is for turning it off. Explains itself when it can't be turned back on.
 */
export function ActiveSwitch({ coupon, phases, onChange }: { coupon: Coupon; phases: Phase[]; onChange: (on: boolean) => void }) {
  const t = useT();
  const fmt = useCouponFormat();
  const canEdit = useCan('coupon.write');
  const block = activationBlock(coupon);
  // Turning off is always allowed; turning on isn't when expired or sold out.
  const reason = !canEdit
    ? t('Only Admins can turn coupons on or off.')
    : !coupon.isActive && block === 'expired'
      ? t('Expired on {date}. Set a later expiry date to turn it back on.', { date: fmt.dateTime(coupon.expiresAt) })
      : !coupon.isActive && block === 'out_of_stock'
        ? t('All {count} have been claimed. Raise the quantity to turn it back on.', { count: fmt.number(claimLimit(coupon)) })
        : '';
  // The list renders each coupon twice (table and phone cards), so the id must be per instance.
  const reasonId = `active-reason-${useId()}`;
  return (
    <div className="flex items-center gap-2.5">
      {/* Wrapper carries the tooltip, since disabled buttons don't receive hover events everywhere. */}
      <span title={reason || undefined} className="inline-flex">
        <Toggle checked={coupon.isActive} onChange={onChange} label={t('On: {name}', { name: coupon.title })} hideLabel disabled={Boolean(reason)} describedBy={reason ? reasonId : undefined} />
      </span>
      {reason && (
        <span id={reasonId} className="sr-only">
          {reason}
        </span>
      )}
      <CouponStatusBadge status={couponStatus(coupon, phases)} />
    </div>
  );
}

export function RemainingBar({ coupon }: { coupon: Coupon }) {
  const t = useT();
  const fmt = useCouponFormat();
  const remaining = remainingStock(coupon);
  const pct = claimLimit(coupon) ? (remaining / claimLimit(coupon)) * 100 : 0;
  const low = pct > 0 && pct <= 10;
  return (
    <div className="w-[140px]">
      <p className="text-[13px] text-[#374151] tabular-nums">
        <span className="font-medium text-[#1A1A1A]">{fmt.number(remaining)}</span> / {fmt.number(claimLimit(coupon))}
      </p>
      <div
        role="meter"
        aria-label={t('Remaining')}
        aria-valuemin={0}
        aria-valuemax={claimLimit(coupon)}
        aria-valuenow={remaining}
        className="mt-1 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden"
      >
        <div className={`h-full rounded-full ${low ? 'bg-[#D97706]' : 'bg-[#FF6115]'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
