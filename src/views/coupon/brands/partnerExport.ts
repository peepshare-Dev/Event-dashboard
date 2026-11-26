// Per-partner CSV exports (all time, every phase). Same numbers as the Partners list and Overview tab.

import { claimLimit, COUPON_STATUS_LABELS, couponStatus, remainingStock, type Brand, type Coupon, type Phase } from '../../../data/coupons';
import { downloadCsv, fileSlug, toCsv } from '../dashboard/metrics';
import { toLocalParts } from '../format';

export interface PartnerStats {
  count: number;
  total: number;
  views: number;
  viewers: number;
  claimed: number;
  redeemed: number;
  /** Redeemed ÷ claimed, as a percentage with one decimal. */
  ratePct: number;
  remaining: number;
}

export function partnerStats(coupons: Coupon[]): PartnerStats {
  const sum = (f: (c: Coupon) => number) => coupons.reduce((s, c) => s + f(c), 0);
  const claimed = sum((c) => c.claimedCount);
  const redeemed = sum((c) => c.redeemedCount);
  return {
    count: coupons.length,
    total: sum(claimLimit),
    views: sum((c) => c.viewCount),
    // A user who opened two of the partner's coupons counts once per coupon.
    viewers: sum((c) => c.viewerCount),
    claimed,
    redeemed,
    ratePct: claimed ? Math.round((redeemed / claimed) * 1000) / 10 : 0,
    remaining: sum(remainingStock),
  };
}

const stamp = (iso: string) => `${toLocalParts(iso).date} ${toLocalParts(iso).time}`;

/** One row per coupon of this partner. */
export function exportPartnerCoupons(brand: Brand, coupons: Coupon[], phases: Phase[]): void {
  const own = coupons.filter((c) => c.brandId === brand.id);
  const csv = toCsv(
    ['Partner', 'Coupon ID', 'Coupon', 'Campaign', 'Status', 'Code type', 'Total quantity', 'Campaign quantity', 'Views', 'Unique viewers', 'Claimed', 'Redeemed', 'Redemption rate (%)', 'Remaining', 'Expires', 'Created'],
    own.map((c) => {
      const s = partnerStats([c]);
      return [
        brand.name,
        c.id,
        c.title,
        phases.find((p) => p.id === c.phaseId)?.name ?? 'Not in a campaign',
        COUPON_STATUS_LABELS[couponStatus(c, phases)],
        c.codeType === 'single' ? 'One code for everyone' : 'Unique code per coupon',
        c.totalQuantity,
        c.phaseQuantity ?? '',
        c.viewCount,
        c.viewerCount,
        c.claimedCount,
        c.redeemedCount,
        s.ratePct,
        s.remaining,
        stamp(c.expiresAt),
        stamp(c.createdAt),
      ];
    }),
  );
  downloadCsv(`partner_${fileSlug(brand.name, brand.id)}_${toLocalParts(new Date().toISOString()).date}.csv`, csv);
}
