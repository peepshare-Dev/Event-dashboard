import { claimLimit, remainingStock, type Coupon } from '../../../data/coupons';

export interface PhaseStats {
  couponCount: number;
  brandCount: number;
  /** Sum of what each coupon can be claimed up to in its phase. */
  total: number;
  claimed: number;
  redeemed: number;
  remaining: number;
}

/** Totals over a phase's coupons (all time, not a date range). */
export function phaseStats(coupons: Coupon[]): PhaseStats {
  return {
    couponCount: coupons.length,
    brandCount: new Set(coupons.map((c) => c.brandId)).size,
    total: coupons.reduce((s, c) => s + claimLimit(c), 0),
    claimed: coupons.reduce((s, c) => s + c.claimedCount, 0),
    redeemed: coupons.reduce((s, c) => s + c.redeemedCount, 0),
    remaining: coupons.reduce((s, c) => s + remainingStock(c), 0),
  };
}
