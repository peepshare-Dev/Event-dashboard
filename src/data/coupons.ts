// Coupon service — data model, role permissions and the business rules shared by every page.
// Users "Claim" a coupon in the app, then "Use/Redeem" it by showing the barcode at the store.

/** ISO 8601 timestamp, e.g. '2026-11-23T09:30:00.000Z'. */
export type ISODate = string;

export type PhaseStatus = 'draft' | 'scheduled' | 'active' | 'ended';

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  ended: 'Ended',
};

/** Status comes from the dates, except that a phase with no coupons yet is a draft. */
export function derivePhaseStatus(p: Pick<Phase, 'startDate' | 'endDate'>, couponCount: number, now = new Date().toISOString()): PhaseStatus {
  if (!couponCount) return 'draft';
  if (now < p.startDate) return 'scheduled';
  if (now > p.endDate) return 'ended';
  return 'active';
}

/** Calendar days, counting both the first and the last day (1 Jan – 14 Feb = 45). */
export function phaseDurationDays(startDate: string, endDate: string): number {
  const day = (iso: string) => {
    const d = new Date(iso);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };
  return Math.round((day(endDate) - day(startDate)) / 86_400_000) + 1;
}

/** Other phases whose dates share at least one moment with this range. */
export function overlappingPhases(range: Pick<Phase, 'startDate' | 'endDate'>, phases: Phase[], exceptId?: string): Phase[] {
  return phases.filter((p) => p.id !== exceptId && range.startDate <= p.endDate && range.endDate >= p.startDate);
}

export interface Phase {
  id: string;
  name: string;
  startDate: ISODate;
  endDate: ISODate;
  status: PhaseStatus;
  createdAt: ISODate;
}

export interface BrandNote {
  id: string;
  brandId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: ISODate;
  /** Set when the note was edited; shown as "Edited · {time}". */
  updatedAt?: ISODate;
}

export interface BrandDocument {
  id: string;
  brandId: string;
  fileName: string;
  fileUrl: string;
  /** Who uploaded it, for the "uploader or Admin can delete" rule. */
  uploadedById: string;
  uploadedBy: string;
  uploadedAt: ISODate;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  /** Admin's partner switch. The brand still counts as ended once partnerEndDate has passed. */
  isPartnerActive: boolean;
  partnerStartDate?: ISODate;
  /** Contract end. Once it has passed the brand shows as "Contract ended" and its logo is hidden. */
  partnerEndDate?: ISODate;
  /** Partner logo order in the app (ascending). Unset sorts after set, then by name. */
  displayOrder?: number;
  /** Pre-fills the conditions of new coupons for this brand (each coupon can still change them). */
  defaultConditionsHtml?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  /** CouponUser id of the BD who owns the relationship. */
  ownerBdId?: string;
  notes: BrandNote[];
  documents: BrandDocument[];
}

/** Profile fields set on the brand page; notes and documents have their own calls. */
export type BrandProfile = Omit<Brand, 'id' | 'notes' | 'documents' | 'displayOrder'>;

/** BD can keep the relationship details up to date; everything else on a brand is Admin-only. */
export const BRAND_CONTACT_FIELDS = ['contactName', 'contactPhone', 'contactEmail', 'ownerBdId'] as const;

export type BrandPartnerStatus = 'active' | 'inactive' | 'contract_ended';

export const BRAND_PARTNER_STATUS_LABELS: Record<BrandPartnerStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  contract_ended: 'Contract ended',
};

export function isContractEnded(b: Pick<Brand, 'partnerEndDate'>, now = new Date().toISOString()): boolean {
  return Boolean(b.partnerEndDate && b.partnerEndDate < now);
}

/** "Contract ended" wins over the partner switch. */
export function brandPartnerStatus(b: Pick<Brand, 'isPartnerActive' | 'partnerEndDate'>, now = new Date().toISOString()): BrandPartnerStatus {
  if (isContractEnded(b, now)) return 'contract_ended';
  return b.isPartnerActive ? 'active' : 'inactive';
}

export type CouponCodeType = 'single' | 'unique';

export interface Coupon {
  id: string;
  /** Unset until the coupon is added to a phase (coupons are created first, then added on the Phases page). */
  phaseId?: string;
  brandId: string;
  title: string;
  conditionsHtml: string;
  couponImageUrl: string;
  codeType: CouponCodeType;
  /** codeType 'single': one barcode shared by every claim. */
  barcode?: string;
  /** codeType 'unique': one code per claim; length should equal totalQuantity. */
  uniqueCodes?: string[];
  totalQuantity: number;
  /** How many can be claimed while in its phase (≤ totalQuantity). Set when added to a phase; unset = the whole quantity. */
  phaseQuantity?: number;
  claimedCount: number;
  redeemedCount: number;
  /** Times users opened Coupon Detail in the app. */
  viewCount: number;
  /** Distinct users who opened Coupon Detail. */
  viewerCount: number;
  expiresAt: ISODate;
  isActive: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Banner on the Coupon landing screen in the app (a separate set from Media Ads banners). */
export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: ISODate;
  endDate?: ISODate;
}

/** One opening of the Coupon Detail screen in the app, recorded for the Data Viewer. */
export interface CouponView {
  id: string;
  couponId: string;
  userId: string;
  viewedAt: ISODate;
}

export interface Redemption {
  id: string;
  couponId: string;
  userId: string;
  claimedAt: ISODate;
  /** Unset = claimed but not used yet. */
  redeemedAt?: ISODate;
}

// --- Roles ---

export type CouponRole = 'admin' | 'bd';

export interface CouponUser {
  id: string;
  name: string;
  role: CouponRole;
}

export const COUPON_ROLE_LABELS: Record<CouponRole, string> = {
  admin: 'Admin',
  bd: 'BD',
};

/** Write actions. Every role can view every page. */
export type CouponPermission =
  | 'coupon.write'
  | 'phase.write'
  | 'banner.write'
  /** Brand name, logo, partner switch and period, default conditions. */
  | 'brand.write'
  /** Brand contacts and owner BD. */
  | 'brandContact.write'
  | 'brandNote.write'
  | 'brandDocument.write';

export const COUPON_ROLE_PERMISSIONS: Record<CouponRole, readonly CouponPermission[]> = {
  admin: ['coupon.write', 'phase.write', 'banner.write', 'brand.write', 'brandContact.write', 'brandNote.write', 'brandDocument.write'],
  bd: ['brandContact.write', 'brandNote.write', 'brandDocument.write'],
};

export function can(user: CouponUser, permission: CouponPermission): boolean {
  return COUPON_ROLE_PERMISSIONS[user.role].includes(permission);
}

/** Everyone edits only their own notes. */
export function canEditNote(user: CouponUser, note: BrandNote): boolean {
  return can(user, 'brandNote.write') && note.authorId === user.id;
}

/** BD deletes only their own notes; Admin deletes any. */
export function canDeleteNote(user: CouponUser, note: BrandNote): boolean {
  return can(user, 'brandNote.write') && (user.role === 'admin' || note.authorId === user.id);
}

/** The uploader or an Admin. */
export function canDeleteDocument(user: CouponUser, doc: BrandDocument): boolean {
  return can(user, 'brandDocument.write') && (user.role === 'admin' || doc.uploadedById === user.id);
}

// --- Live state ---

export function isPhaseLive(phase: Phase, now = new Date().toISOString()): boolean {
  return phase.startDate <= now && now <= phase.endDate;
}

/** The most users can claim: the phase quantity when one is set, else the whole quantity. */
export function claimLimit(c: Pick<Coupon, 'totalQuantity' | 'phaseQuantity'>): number {
  return c.phaseQuantity ?? c.totalQuantity;
}

export function remainingStock(c: Coupon): number {
  return Math.max(0, claimLimit(c) - c.claimedCount);
}

/** Claimable in the app right now: active, not expired, in stock, in a live phase. */
export function isCouponLive(c: Coupon, phases: Phase[], now = new Date().toISOString()): boolean {
  const phase = c.phaseId ? phases.find((p) => p.id === c.phaseId) : undefined;
  return c.isActive && c.expiresAt > now && remainingStock(c) > 0 && Boolean(phase && isPhaseLive(phase, now));
}

/** Why a coupon can't be turned on, or null if it can. */
export type ActivationBlock = 'expired' | 'out_of_stock';

export function activationBlock(c: Pick<Coupon, 'expiresAt' | 'totalQuantity' | 'phaseQuantity' | 'claimedCount'>, now = new Date().toISOString()): ActivationBlock | null {
  if (c.expiresAt <= now) return 'expired';
  if (claimLimit(c) - c.claimedCount <= 0) return 'out_of_stock';
  return null;
}

/**
 * What the list shows. A coupon goes Active by itself while its phase runs; the switch only turns it off.
 * Expired / Out of stock win over the switch, and the switch wins over the phase dates.
 */
export type CouponDisplayStatus = 'active' | 'scheduled' | 'campaign_ended' | 'no_campaign' | 'inactive' | ActivationBlock;

export const COUPON_STATUS_LABELS: Record<CouponDisplayStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  campaign_ended: 'Campaign ended',
  no_campaign: 'Not in a campaign',
  inactive: 'Turned off',
  expired: 'Expired',
  out_of_stock: 'Out of stock',
};

/** 'active' exactly when `isCouponLive`. */
export function couponStatus(c: Coupon, phases: Phase[], now = new Date().toISOString()): CouponDisplayStatus {
  const block = activationBlock(c, now);
  if (block) return block;
  if (!c.isActive) return 'inactive';
  const phase = c.phaseId ? phases.find((p) => p.id === c.phaseId) : undefined;
  if (!phase) return 'no_campaign';
  if (now < phase.startDate) return 'scheduled';
  if (now > phase.endDate) return 'campaign_ended';
  return 'active';
}

// --- Codes ---

/** Code 128 holds printable ASCII only (no Thai, no emoji). */
export const CODE_MAX_LENGTH = 48;
export function isBarcodeValue(value: string): boolean {
  return /^[\x20-\x7E]+$/.test(value) && value.length <= CODE_MAX_LENGTH;
}

export interface ParsedCodes {
  codes: string[];
  /** Codes that appeared more than once; only the first copy is kept. */
  duplicates: string[];
  /** 1-based file rows that a barcode can't hold. */
  invalidRows: { row: number; value: string }[];
}

/** One code per row; the first column is used. A "code" / "barcode" header row is skipped. */
export function parseCodesCsv(text: string): ParsedCodes {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  const codes: string[] = [];
  const invalidRows: ParsedCodes['invalidRows'] = [];
  text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .forEach((line, i) => {
      const value = line.split(',')[0].trim().replace(/^"(.*)"$/, '$1').trim();
      if (!value || (i === 0 && /^(unique\s*)?(code|barcode)s?$/i.test(value))) return;
      if (!isBarcodeValue(value)) invalidRows.push({ row: i + 1, value });
      else if (seen.has(value)) duplicates.add(value);
      else {
        seen.add(value);
        codes.push(value);
      }
    });
  return { codes, duplicates: [...duplicates], invalidRows };
}

/** Letters and digits that can't be misread for each other (no 0/O, 1/I/L). */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const GENERATE_MAX_CODES = 100_000;
export const CODE_PREFIX_MAX_LENGTH = 12;

function randomCode(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

/** A single barcode value, e.g. 'PIZZA-7KQ4M9XT'. */
export function generateCode(prefix = ''): string {
  return prefix ? `${prefix}-${randomCode(8)}` : randomCode(10);
}

/** `count` distinct codes. 8 random characters give ~850 billion combinations, so retries are rare. */
export function generateCodes(count: number, prefix = ''): string[] {
  const codes = new Set<string>();
  while (codes.size < count) codes.add(generateCode(prefix));
  return [...codes];
}

// --- Display page ---

/** Why a partner logo the admin left Visible is hidden by the auto-hide rule. */
export type AutoHideReason = 'contract_ended' | 'no_active_phase_coupon' | 'coupons_off' | 'all_expired' | 'out_of_stock';

export const AUTO_HIDE_REASON_LABELS: Record<AutoHideReason, string> = {
  contract_ended: 'Contract ended',
  no_active_phase_coupon: 'No coupon in active campaign',
  coupons_off: 'All coupons turned off',
  all_expired: 'All coupons expired',
  out_of_stock: 'Out of stock',
};

export type PartnerLogoStatus = { status: 'visible'; liveCoupons: number } | { status: 'hidden' } | { status: 'auto_hidden'; reason: AutoHideReason };

/**
 * A logo shows in the app only if the brand is an active partner AND its contract hasn't ended
 * AND it has at least one live coupon (active, not expired, in stock, in an active phase).
 * "Hidden" means an admin switched the partner off; "auto-hidden" names the first automatic
 * check that failed, so it says what to fix. A passed contract end wins over the switch.
 */
export function partnerLogoStatus(brand: Brand, coupons: Coupon[], phases: Phase[], now = new Date().toISOString()): PartnerLogoStatus {
  if (isContractEnded(brand, now)) return { status: 'auto_hidden', reason: 'contract_ended' };
  if (!brand.isPartnerActive) return { status: 'hidden' };
  const own = coupons.filter((c) => c.brandId === brand.id);
  const live = own.filter((c) => isCouponLive(c, phases, now)).length;
  if (live) return { status: 'visible', liveCoupons: live };
  const livePhaseIds = new Set(phases.filter((p) => isPhaseLive(p, now)).map((p) => p.id));
  const inPhase = own.filter((c) => c.phaseId && livePhaseIds.has(c.phaseId));
  const turnedOn = inPhase.filter((c) => c.isActive);
  const notExpired = turnedOn.filter((c) => c.expiresAt > now);
  const reason: AutoHideReason = !inPhase.length ? 'no_active_phase_coupon' : !turnedOn.length ? 'coupons_off' : !notExpired.length ? 'all_expired' : 'out_of_stock';
  return { status: 'auto_hidden', reason };
}

/** Same labels as the Media Ads banner badge. */
export type CouponBannerStatus = 'Active' | 'Scheduled' | 'Expired' | 'Inactive';

/** Active banners show only inside their schedule, if they have one. */
export function bannerStatus(b: Banner, now = new Date().toISOString()): CouponBannerStatus {
  if (!b.isActive) return 'Inactive';
  if (b.startDate && now < b.startDate) return 'Scheduled';
  if (b.endDate && now > b.endDate) return 'Expired';
  return 'Active';
}

/** By displayOrder (unset last), then by name. */
export function comparePartnerLogos(a: Brand, b: Brand): number {
  const ao = a.displayOrder ?? Number.POSITIVE_INFINITY;
  const bo = b.displayOrder ?? Number.POSITIVE_INFINITY;
  return ao !== bo ? ao - bo : a.name.localeCompare(b.name, 'th');
}
