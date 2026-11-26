// Dashboard numbers, computed from the phase's coupons and the redemption records in the date range.
// Pure functions, so every tile, chart, table and alert agrees.

import { claimLimit, remainingStock, type Coupon, type Phase, type Redemption, type Brand } from '../../../data/coupons';
import { toLocalParts } from '../format';

const DAY = 86_400_000;
export const EXPIRING_DAYS = 7;
export const LOW_STOCK_SHARE = 0.1;
export const LOW_REDEMPTION_RATE = 0.2;
/** Fewer claims than this is too small a sample to call a redemption rate low. */
export const LOW_RATE_MIN_CLAIMS = 10;

/** Local 'YYYY-MM-DD' range → the ISO instants it covers (start of first day → end of last day). */
export function rangeToIso(start: string, end: string): { from: string; to: string } {
  return { from: new Date(`${start}T00:00:00`).toISOString(), to: new Date(`${end}T23:59:59.999`).toISOString() };
}

const inRange = (iso: string | undefined, from: string, to: string): iso is string => Boolean(iso && from <= iso && iso <= to);
const rate = (part: number, whole: number) => (whole ? part / whole : 0);

export interface DailyPoint {
  /** Local 'YYYY-MM-DD'. */
  date: string;
  claims: number;
  redemptions: number;
}

/** One point per local day, zero-filled, claims by claimedAt and redemptions by redeemedAt. */
export function dailySeries(rows: Redemption[], start: string, end: string): DailyPoint[] {
  const { from, to } = rangeToIso(start, end);
  const days = new Map<string, DailyPoint>();
  for (let d = new Date(`${start}T12:00:00`); toLocalParts(d.toISOString()).date <= end; d = new Date(d.getTime() + DAY)) {
    const date = toLocalParts(d.toISOString()).date;
    days.set(date, { date, claims: 0, redemptions: 0 });
  }
  for (const r of rows) {
    if (inRange(r.claimedAt, from, to)) days.get(toLocalParts(r.claimedAt).date)!.claims++;
    if (inRange(r.redeemedAt, from, to)) days.get(toLocalParts(r.redeemedAt).date)!.redemptions++;
  }
  return [...days.values()];
}

export interface CouponRow {
  coupon: Coupon;
  brand?: Brand;
  /** In the date range. */
  claimed: number;
  redeemed: number;
  rate: number;
  /** Now, not limited to the date range. */
  remaining: number;
  remainingShare: number;
}

export function couponRows(coupons: Coupon[], brands: Brand[], rows: Redemption[], start: string, end: string): CouponRow[] {
  const { from, to } = rangeToIso(start, end);
  return coupons.map((coupon) => {
    const own = rows.filter((r) => r.couponId === coupon.id);
    const claimed = own.filter((r) => inRange(r.claimedAt, from, to)).length;
    const redeemed = own.filter((r) => inRange(r.redeemedAt, from, to)).length;
    const remaining = remainingStock(coupon);
    return {
      coupon,
      brand: brands.find((s) => s.id === coupon.brandId),
      claimed,
      redeemed,
      rate: rate(redeemed, claimed),
      remaining,
      remainingShare: rate(remaining, claimLimit(coupon)),
    };
  });
}

export interface BrandRow {
  brand: Brand;
  claimed: number;
  redeemed: number;
  rate: number;
}

/** Brands with a coupon in the phase, most redemptions first. */
export function brandRows(couponRowsList: CouponRow[]): BrandRow[] {
  const byBrand = new Map<string, BrandRow>();
  for (const r of couponRowsList) {
    if (!r.brand) continue;
    const row = byBrand.get(r.brand.id) ?? { brand: r.brand, claimed: 0, redeemed: 0, rate: 0 };
    row.claimed += r.claimed;
    row.redeemed += r.redeemed;
    byBrand.set(r.brand.id, row);
  }
  return [...byBrand.values()]
    .map((r) => ({ ...r, rate: rate(r.redeemed, r.claimed) }))
    .sort((a, b) => b.redeemed - a.redeemed || a.brand.name.localeCompare(b.brand.name, 'th'));
}

export interface Kpis {
  couponCount: number;
  brandCount: number;
  total: number;
  claimed: number;
  claimedShare: number;
  redeemed: number;
  redemptionRate: number;
  remaining: number;
  remainingShare: number;
  /** Whole days until the phase ends; negative once ended. */
  daysLeft: number;
  /** Whole days until it starts; 0 once started. */
  daysToStart: number;
}

export function kpis(rows: CouponRow[], phase: Phase, now = Date.now()): Kpis {
  const total = rows.reduce((s, r) => s + claimLimit(r.coupon), 0);
  const claimed = rows.reduce((s, r) => s + r.claimed, 0);
  const redeemed = rows.reduce((s, r) => s + r.redeemed, 0);
  const remaining = rows.reduce((s, r) => s + r.remaining, 0);
  return {
    couponCount: rows.length,
    brandCount: new Set(rows.map((r) => r.coupon.brandId)).size,
    total,
    claimed,
    claimedShare: rate(claimed, total),
    redeemed,
    redemptionRate: rate(redeemed, claimed),
    remaining,
    remainingShare: rate(remaining, total),
    daysLeft: Math.ceil((Date.parse(phase.endDate) - now) / DAY),
    daysToStart: Math.max(0, Math.ceil((Date.parse(phase.startDate) - now) / DAY)),
  };
}

export interface Alerts {
  expiring: CouponRow[];
  outOfStock: CouponRow[];
  lowRateBrands: BrandRow[];
}

export function alerts(rows: CouponRow[], brands: BrandRow[], now = Date.now()): Alerts {
  const nowIso = new Date(now).toISOString();
  const soon = new Date(now + EXPIRING_DAYS * DAY).toISOString();
  return {
    // Still claimable, so expiring matters.
    expiring: rows
      .filter((r) => r.coupon.isActive && r.remaining > 0 && r.coupon.expiresAt > nowIso && r.coupon.expiresAt <= soon)
      .sort((a, b) => a.coupon.expiresAt.localeCompare(b.coupon.expiresAt)),
    outOfStock: rows.filter((r) => r.remaining === 0),
    lowRateBrands: brands.filter((s) => s.claimed >= LOW_RATE_MIN_CLAIMS && s.rate < LOW_REDEMPTION_RATE).sort((a, b) => a.rate - b.rate),
  };
}

/** One CSV cell: quoted, and neutralised if a spreadsheet would read it as a formula. */
function csvCell(value: string | number): string {
  if (typeof value === 'number') return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** CSV with a BOM, so Excel opens Thai text correctly. */
export function toCsv(header: string[], body: (string | number)[][]): string {
  return '﻿' + [header, ...body].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

/** Saves the CSV through the browser's download. */
export function downloadCsv(fileName: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  Object.assign(document.createElement('a'), { href: url, download: fileName }).click();
  URL.revokeObjectURL(url);
}

/** File-name-safe slug ('The Pizza Company' → 'the-pizza-company'), or `fallback` for e.g. Thai-only names. */
export function fileSlug(name: string, fallback: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;
}
