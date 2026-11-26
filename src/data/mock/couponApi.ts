// MOCK ONLY — stands in for the Coupon service API, which doesn't exist in this project yet.
// Replace each function with the real request; the signatures are the contract.
// The real backend knows the signed-in user from the session; here `setCouponSession` plays that part,
// and writes are permission-checked the way the server must check them (UI gating alone isn't enough).

import {
  BRAND_CONTACT_FIELDS,
  activationBlock,
  can,
  derivePhaseStatus,
  canDeleteDocument,
  canDeleteNote,
  canEditNote,
  type Banner,
  type Coupon,
  type CouponPermission,
  type CouponView,
  type CouponUser,
  type Phase,
  type Redemption,
  type Brand,
  type BrandProfile,
  type BrandDocument,
  type BrandNote,
} from '../coupons';
import { bannersSeed, brandsSeed, couponsSeed, couponUsers, couponViewsSeed, DEV_COUPON_USERS, phasesSeed, redemptionsSeed } from './couponSeed';

const LATENCY = 450;
const wait = (ms = LATENCY) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T,>(v: T): T => structuredClone(v);
let nextId = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(nextId++).toString(36)}`;
const now = () => new Date().toISOString();

export class CouponApiError extends Error {
  constructor(
    public status: 400 | 403 | 404 | 409,
    message: string,
  ) {
    super(message);
  }
}

let session: CouponUser = DEV_COUPON_USERS.admin;
/** Mock only: who the "server" thinks is signed in. */
export function setCouponSession(user: CouponUser) {
  session = user;
}

function ensure(allowed: boolean): void {
  if (!allowed) throw new CouponApiError(403, 'You don’t have permission to do this.');
}
const requirePermission = (p: CouponPermission) => ensure(can(session, p));

/** Same rule the list shows: an expired or sold-out coupon can't be turned on. */
function ensureCanActivate(c: Pick<Coupon, 'title' | 'expiresAt' | 'totalQuantity' | 'phaseQuantity' | 'claimedCount'>) {
  const block = activationBlock(c);
  if (block === 'expired') throw new CouponApiError(409, `“${c.title}” has expired, so it can’t be activated.`);
  if (block === 'out_of_stock') throw new CouponApiError(409, `“${c.title}” is out of stock, so it can’t be activated.`);
}

function find<T extends { id: string }>(list: T[], id: string, what: string): T {
  const item = list.find((x) => x.id === id);
  if (!item) throw new CouponApiError(404, `${what} not found.`);
  return item;
}

let phases = clone(phasesSeed);
const brands = clone(brandsSeed);
let coupons = clone(couponsSeed);
let banners = clone(bannersSeed);
const redemptions = clone(redemptionsSeed);
const views = clone(couponViewsSeed);

/** Status is derived by the server, so it isn't sent. */
export type PhaseInput = Omit<Phase, 'id' | 'createdAt' | 'status'> & { id?: string };

const withStatus = (p: Phase): Phase => ({ ...p, status: derivePhaseStatus(p, coupons.filter((c) => c.phaseId === p.id).length) });
/** Phase membership and quantity are set on the Phases page (`phases.save`), so they aren't sent here. */
export type CouponInput = Omit<Coupon, 'id' | 'phaseId' | 'phaseQuantity' | 'claimedCount' | 'redeemedCount' | 'viewCount' | 'viewerCount' | 'createdAt' | 'updatedAt'> & { id?: string };
export type BrandInput = Pick<Brand, 'name' | 'logoUrl'>;
export type BannerInput = Omit<Banner, 'id' | 'sortOrder'> & { id?: string };

/** A coupon to add to a phase, and how many of it can be claimed there. */
export interface CouponAllocation {
  couponId: string;
  quantity: number;
}

/** At least what's already been claimed (and at least 1), at most the coupon's total quantity. */
function ensureQuantity(c: Coupon, quantity: number) {
  const min = Math.max(1, c.claimedCount);
  if (!Number.isInteger(quantity) || quantity < min || quantity > c.totalQuantity)
    throw new CouponApiError(400, `The quantity for “${c.title}” must be a whole number from ${min} to ${c.totalQuantity}.`);
}

/** Checks every allocation before anything changes, so adding is all or nothing. */
function checkAllocations(phase: Pick<Phase, 'startDate'> & { id?: string }, items: CouponAllocation[]): Coupon[] {
  return items.map(({ couponId, quantity }) => {
    const c = find(coupons, couponId, 'Coupon');
    if (c.phaseId && c.phaseId !== phase.id) throw new CouponApiError(409, `“${c.title}” is already in another campaign.`);
    if (c.expiresAt < phase.startDate) throw new CouponApiError(409, `“${c.title}” expires before this campaign starts.`);
    ensureQuantity(c, quantity);
    return c;
  });
}

function leavePhase(c: Coupon) {
  delete c.phaseId;
  delete c.phaseQuantity;
}

export interface CouponListFilter {
  /** 'none' = coupons not in a phase yet. */
  phaseId?: string;
  brandId?: string;
  /** Matches title or brand name. */
  q?: string;
}

export interface RedemptionListFilter {
  /** Inclusive range; a record matches if it was claimed or redeemed inside it. */
  from: string;
  to: string;
  phaseId?: string;
  brandId?: string;
  couponId?: string;
}

export const couponApi = {
  users: {
    /** Back-office people who can own a brand relationship (BD). */
    async listBd(): Promise<CouponUser[]> {
      await wait();
      return clone(Object.values(couponUsers).filter((u) => u.role === 'bd'));
    },
  },

  phases: {
    async list(): Promise<Phase[]> {
      await wait();
      return clone(phases.map(withStatus)).sort((a, b) => a.startDate.localeCompare(b.startDate));
    },
    /**
     * Creates (no id) or updates. Overlapping another phase is allowed; the UI warns about it.
     * `allocations`, when sent, is the phase's whole coupon set: missing ones leave it (refused once claimed). All or nothing.
     */
    async save(input: PhaseInput, allocations?: CouponAllocation[]): Promise<Phase> {
      await wait(600);
      requirePermission('phase.write');
      const name = input.name.trim();
      if (!name || name.length > 60) throw new CouponApiError(400, 'The campaign name must be 1–60 characters.');
      if (!(input.startDate < input.endDate)) throw new CouponApiError(400, 'The end date must be after the start date.');
      const existing = input.id ? find(phases, input.id, 'Campaign') : undefined;
      const id = existing?.id ?? uid('ph');
      const stamp = now();
      if (allocations) {
        const targets = checkAllocations({ ...input, id }, allocations);
        const leaving = existing ? coupons.filter((c) => c.phaseId === id && !allocations.some((a) => a.couponId === c.id)) : [];
        const claimed = leaving.find((c) => c.claimedCount > 0);
        if (claimed) throw new CouponApiError(409, `Users have claimed “${claimed.title}”, so it can’t leave the campaign. Turn it off instead.`);
        leaving.forEach((c) => {
          leavePhase(c);
          c.updatedAt = stamp;
        });
        targets.forEach((c, i) => Object.assign(c, { phaseId: id, phaseQuantity: allocations[i].quantity, updatedAt: stamp }));
      }
      const saved: Phase = withStatus({ ...input, name, id, status: 'draft', createdAt: existing?.createdAt ?? now() });
      phases = existing ? phases.map((p) => (p.id === saved.id ? saved : p)) : [...phases, saved];
      return clone(saved);
    },
    /** Refused once any of its coupons has been claimed. Its coupons are kept, back out of any phase. */
    async remove(id: string): Promise<void> {
      await wait();
      requirePermission('phase.write');
      const own = coupons.filter((c) => c.phaseId === id);
      const claimed = own.reduce((s, c) => s + c.claimedCount, 0);
      if (claimed) throw new CouponApiError(409, `Users have claimed ${claimed} coupons in this campaign, so it can’t be deleted.`);
      own.forEach(leavePhase);
      phases = phases.filter((p) => p.id !== id);
    },
    /** Changes how many of a coupon can be claimed in its phase. */
    async setCouponQuantity(couponId: string, quantity: number): Promise<Coupon> {
      await wait();
      requirePermission('phase.write');
      const c = find(coupons, couponId, 'Coupon');
      if (!c.phaseId) throw new CouponApiError(409, `“${c.title}” isn’t in a campaign.`);
      ensureQuantity(c, quantity);
      Object.assign(c, { phaseQuantity: quantity, updatedAt: now() });
      return clone(c);
    },
    /** Takes a coupon back out of its phase. Refused once users have claimed it. */
    async removeCoupon(couponId: string): Promise<Coupon> {
      await wait();
      requirePermission('phase.write');
      const c = find(coupons, couponId, 'Coupon');
      if (c.claimedCount > 0) throw new CouponApiError(409, `Users have claimed “${c.title}”, so it can’t leave the campaign. Turn it off instead.`);
      leavePhase(c);
      c.updatedAt = now();
      return clone(c);
    },
  },

  brands: {
    async list(): Promise<Brand[]> {
      await wait();
      return clone(brands).sort((a, b) => a.name.localeCompare(b.name, 'th'));
    },
    async get(id: string): Promise<Brand> {
      await wait();
      return clone(find(brands, id, 'Partner'));
    },
    /** New brand: a name and a logo. Everything else is filled in on its brand page. */
    async create(input: BrandInput): Promise<Brand> {
      await wait(600);
      requirePermission('brand.write');
      const name = input.name.trim();
      if (brands.some((b) => b.name.toLowerCase() === name.toLowerCase())) throw new CouponApiError(409, `A partner named “${name}” already exists.`);
      const brand: Brand = { id: uid('br'), name, logoUrl: input.logoUrl, isPartnerActive: true, notes: [], documents: [] };
      brands.push(brand);
      return clone(brand);
    },
    /**
     * Brand page saves. Contacts and owner BD need brandContact.write (Admin and BD); everything
     * else needs brand.write (Admin). `undefined` in the patch clears an optional field.
     */
    async update(id: string, patch: Partial<BrandProfile>): Promise<Brand> {
      await wait(600);
      const keys = Object.keys(patch) as (keyof BrandProfile)[];
      const contactOnly = keys.every((k) => (BRAND_CONTACT_FIELDS as readonly string[]).includes(k));
      requirePermission(contactOnly ? 'brandContact.write' : 'brand.write');
      const brand = find(brands, id, 'Partner');
      const next = { ...brand, ...patch };
      next.name = next.name.trim();
      if (!next.name) throw new CouponApiError(400, 'Enter the partner name.');
      if (brands.some((b) => b.id !== id && b.name.toLowerCase() === next.name.toLowerCase())) throw new CouponApiError(409, `A partner named “${next.name}” already exists.`);
      if (next.partnerStartDate && next.partnerEndDate && next.partnerEndDate <= next.partnerStartDate) throw new CouponApiError(400, 'The partner end date must be after the start date.');
      if (next.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.contactEmail)) throw new CouponApiError(400, 'Enter a valid contact email.');
      if (next.ownerBdId && !Object.values(couponUsers).some((u) => u.id === next.ownerBdId && u.role === 'bd')) throw new CouponApiError(400, 'The owner must be a BD team member.');
      Object.assign(brand, next);
      return clone(brand);
    },
    /** Mock: a local blob URL. The real API stores the file and returns its URL. */
    async uploadLogo(file: File): Promise<{ url: string; name: string }> {
      await wait(800);
      requirePermission('brand.write');
      return { url: URL.createObjectURL(file), name: file.name };
    },
    /** Display page: sets displayOrder from the given order (1-based). */
    async reorderLogos(ids: string[]): Promise<Brand[]> {
      await wait();
      requirePermission('banner.write');
      brands.forEach((b) => {
        const i = ids.indexOf(b.id);
        if (i >= 0) b.displayOrder = i + 1;
      });
      return clone(brands);
    },
    async addNote(brandId: string, body: string): Promise<BrandNote> {
      await wait();
      requirePermission('brandNote.write');
      const brand = find(brands, brandId, 'Partner');
      const note: BrandNote = { id: uid('n'), brandId, authorId: session.id, authorName: session.name, body, createdAt: now() };
      brand.notes = [note, ...brand.notes];
      return clone(note);
    },
    async updateNote(noteId: string, body: string): Promise<BrandNote> {
      await wait();
      const note = findNote(noteId);
      ensure(canEditNote(session, note));
      Object.assign(note, { body, updatedAt: now() });
      return clone(note);
    },
    async removeNote(noteId: string): Promise<void> {
      await wait();
      const note = findNote(noteId);
      ensure(canDeleteNote(session, note));
      const brand = find(brands, note.brandId, 'Partner');
      brand.notes = brand.notes.filter((n) => n.id !== noteId);
    },
    async uploadDocument(brandId: string, file: File): Promise<BrandDocument> {
      await wait(900);
      requirePermission('brandDocument.write');
      const brand = find(brands, brandId, 'Partner');
      const doc: BrandDocument = {
        id: uid('d'),
        brandId,
        fileName: file.name,
        // Mock: a local blob URL. The real API returns the stored file's URL.
        fileUrl: URL.createObjectURL(file),
        uploadedById: session.id,
        uploadedBy: session.name,
        uploadedAt: now(),
      };
      brand.documents = [doc, ...brand.documents];
      return clone(doc);
    },
    async removeDocument(docId: string): Promise<void> {
      await wait();
      const brand = brands.find((s) => s.documents.some((d) => d.id === docId));
      const doc = brand?.documents.find((d) => d.id === docId);
      if (!brand || !doc) throw new CouponApiError(404, 'Document not found.');
      ensure(canDeleteDocument(session, doc));
      brand.documents = brand.documents.filter((d) => d.id !== docId);
    },
  },

  coupons: {
    async list(filter: CouponListFilter = {}): Promise<Coupon[]> {
      await wait();
      const q = filter.q?.trim().toLowerCase();
      return clone(
        coupons.filter((c) => {
          if (filter.phaseId && (c.phaseId ?? 'none') !== filter.phaseId) return false;
          if (filter.brandId && c.brandId !== filter.brandId) return false;
          if (q) {
            const brandName = brands.find((s) => s.id === c.brandId)?.name ?? '';
            if (!`${c.title} ${brandName}`.toLowerCase().includes(q)) return false;
          }
          return true;
        }),
      ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async get(id: string): Promise<Coupon> {
      await wait();
      return clone(find(coupons, id, 'Coupon'));
    },
    /** Creates (no id) or updates. Claim / redeem counts are server-owned. */
    async save(input: CouponInput): Promise<Coupon> {
      await wait(600);
      requirePermission('coupon.write');
      const existing = input.id ? find(coupons, input.id, 'Coupon') : undefined;
      // A lower total quantity caps the phase quantity too.
      const phaseQuantity = existing?.phaseQuantity === undefined ? undefined : Math.min(existing.phaseQuantity, input.totalQuantity);
      // Only checked when the switch goes on: an existing coupon that's on just shows Expired / Out of stock.
      if (input.isActive && !existing?.isActive) ensureCanActivate({ ...input, phaseQuantity, claimedCount: existing?.claimedCount ?? 0 });
      const saved: Coupon = {
        ...input,
        id: existing?.id ?? uid('cp'),
        phaseId: existing?.phaseId,
        ...(phaseQuantity !== undefined && { phaseQuantity }),
        claimedCount: existing?.claimedCount ?? 0,
        redeemedCount: existing?.redeemedCount ?? 0,
        viewCount: existing?.viewCount ?? 0,
        viewerCount: existing?.viewerCount ?? 0,
        createdAt: existing?.createdAt ?? now(),
        updatedAt: now(),
      };
      coupons = existing ? coupons.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...coupons];
      return clone(saved);
    },
    async setActive(id: string, isActive: boolean): Promise<Coupon> {
      await wait();
      requirePermission('coupon.write');
      const c = find(coupons, id, 'Coupon');
      if (isActive) ensureCanActivate(c);
      Object.assign(c, { isActive, updatedAt: now() });
      return clone(c);
    },
    /** All or nothing: fails without changing anything if one of them can't be activated. */
    async setActiveMany(ids: string[], isActive: boolean): Promise<Coupon[]> {
      await wait();
      requirePermission('coupon.write');
      const targets = ids.map((id) => find(coupons, id, 'Coupon'));
      if (isActive) targets.forEach(ensureCanActivate);
      const stamp = now();
      targets.forEach((c) => Object.assign(c, { isActive, updatedAt: stamp }));
      return clone(targets);
    },
    /** Mock: a local blob URL. The real API brands the file and returns its URL. */
    async uploadImage(file: File): Promise<{ url: string; name: string }> {
      await wait(800);
      requirePermission('coupon.write');
      return { url: URL.createObjectURL(file), name: file.name };
    },
    async remove(id: string): Promise<void> {
      await wait();
      requirePermission('coupon.write');
      if (find(coupons, id, 'Coupon').claimedCount > 0) throw new CouponApiError(409, 'This coupon has been claimed. Turn it off instead of deleting it.');
      coupons = coupons.filter((c) => c.id !== id);
    },
  },

  banners: {
    async list(): Promise<Banner[]> {
      await wait();
      return clone(banners).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    /** Creates (no id; added last) or updates. */
    async save(input: BannerInput): Promise<Banner> {
      await wait(600);
      requirePermission('banner.write');
      const existing = input.id ? find(banners, input.id, 'Banner') : undefined;
      const saved: Banner = { ...input, id: existing?.id ?? uid('bn'), sortOrder: existing?.sortOrder ?? Math.max(0, ...banners.map((b) => b.sortOrder)) + 1 };
      banners = existing ? banners.map((b) => (b.id === saved.id ? saved : b)) : [...banners, saved];
      return clone(saved);
    },
    async setActive(id: string, isActive: boolean): Promise<Banner> {
      await wait();
      requirePermission('banner.write');
      const b = find(banners, id, 'Banner');
      b.isActive = isActive;
      return clone(b);
    },
    /** Mock: a local blob URL. The real API brands the file and returns its URL. */
    async uploadImage(file: File): Promise<{ url: string; name: string }> {
      await wait(800);
      requirePermission('banner.write');
      return { url: URL.createObjectURL(file), name: file.name };
    },
    async remove(id: string): Promise<void> {
      await wait();
      requirePermission('banner.write');
      banners = banners.filter((b) => b.id !== id);
    },
    /** Sets sortOrder from the given order (1-based). */
    async reorder(ids: string[]): Promise<Banner[]> {
      await wait();
      requirePermission('banner.write');
      banners = banners.map((b) => ({ ...b, sortOrder: ids.indexOf(b.id) + 1 || b.sortOrder }));
      return clone(banners).sort((a, b) => a.sortOrder - b.sortOrder);
    },
  },

  views: {
    /** Data Viewer: who opened Coupon Detail, newest first. */
    async list(filter: { couponId?: string; brandId?: string } = {}): Promise<CouponView[]> {
      await wait();
      const couponIds = new Set(coupons.filter((c) => (!filter.couponId || c.id === filter.couponId) && (!filter.brandId || c.brandId === filter.brandId)).map((c) => c.id));
      return clone(views.filter((v) => couponIds.has(v.couponId))).sort((a, b) => b.viewedAt.localeCompare(a.viewedAt));
    },
    /** Called by the app each time a user opens Coupon Detail. Not a back-office action. */
    async record(couponId: string, userId: string): Promise<void> {
      await wait(100);
      const c = find(coupons, couponId, 'Coupon');
      const firstVisit = !views.some((v) => v.couponId === couponId && v.userId === userId);
      views.push({ id: uid('vw'), couponId, userId, viewedAt: now() });
      c.viewCount += 1;
      if (firstVisit) c.viewerCount += 1;
    },
  },

  redemptions: {
    async list(filter: RedemptionListFilter): Promise<Redemption[]> {
      await wait();
      const inRange = (iso?: string) => Boolean(iso && filter.from <= iso && iso <= filter.to);
      const couponIds = new Set(
        coupons
          .filter((c) => (!filter.phaseId || c.phaseId === filter.phaseId) && (!filter.brandId || c.brandId === filter.brandId) && (!filter.couponId || c.id === filter.couponId))
          .map((c) => c.id),
      );
      return clone(redemptions.filter((r) => couponIds.has(r.couponId) && (inRange(r.claimedAt) || inRange(r.redeemedAt))));
    },
  },
};

function findNote(noteId: string): BrandNote {
  for (const s of brands) {
    const note = s.notes.find((n) => n.id === noteId);
    if (note) return note;
  }
  throw new CouponApiError(404, 'Note not found.');
}
