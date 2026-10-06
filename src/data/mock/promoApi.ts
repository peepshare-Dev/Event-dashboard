// MOCK ONLY — stands in for the banner / cover page / content / coupon APIs, which don't exist
// in this project yet. Replace each function with the real request; the signatures are the contract.
// Latency is simulated so loading and saving states show up as they would against a server.

import type { BannerImageFile, ContentType, PromoItem } from '../appBanners';
import type { SetEvent } from '../setEvents';

const LATENCY = 450;
const wait = (ms = LATENCY) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T,>(v: T): T => structuredClone(v);
let nextId = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(nextId++).toString(36)}`;

/** Flat-colour artwork at the recommended size (banner 1432 × 480, cover page 1080 × 1440), so lists have real thumbnails. */
function artwork(title: string, subtitle: string, from: string, to: string, accent: string, shape: 'banner' | 'cover' = 'banner'): BannerImageFile {
  const [w, h] = shape === 'banner' ? [1432, 480] : [1080, 1440];
  const text =
    shape === 'banner'
      ? `<text x="96" y="230" font-family="Inter,Arial,sans-serif" font-size="88" font-weight="700" fill="#fff">${title}</text>
<text x="100" y="310" font-family="Inter,Arial,sans-serif" font-size="40" fill="#fff" opacity="0.85">${subtitle}</text>`
      : `<text x="540" y="900" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="92" font-weight="700" fill="#fff">${title}</text>
<text x="540" y="990" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="44" fill="#fff" opacity="0.85">${subtitle}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<circle cx="${w * 0.85}" cy="${h * 0.25}" r="${Math.min(w, h) * 0.44}" fill="${accent}" opacity="0.35"/><circle cx="${w * 0.92}" cy="${h * 0.9}" r="${Math.min(w, h) * 0.31}" fill="${accent}" opacity="0.25"/>
${text}
</svg>`;
  return { url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, name: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg` };
}

function item(prefix: string, partial: Partial<PromoItem> & Pick<PromoItem, 'name' | 'priority'>): PromoItem {
  return {
    id: uid(prefix),
    image: null,
    status: 'active',
    displayMode: 'always',
    startAt: '',
    endAt: '',
    clickAction: 'none',
    destinationType: '',
    destinationId: '',
    destinationLabel: '',
    destinationUrl: '',
    createdAt: '2026-09-20T10:00',
    updatedAt: '2026-10-01T09:30',
    ...partial,
  };
}

const bannerSeed: PromoItem[] = [
  item('bnr', {
    name: 'Zumba Fitness 2026',
    priority: 1,
    image: artwork('Zumba Fitness 2026', 'Dance your way to fitness · 1–15 Oct', '#FF6115', '#E5540F', '#FFD9C4'),
    displayMode: 'schedule',
    startAt: '2026-10-01T00:00',
    endAt: '2026-10-15T23:59',
    clickAction: 'app_page',
    destinationType: 'event',
  }),
  item('bnr', {
    name: 'MonoMax Watch Party',
    priority: 2,
    image: artwork('MonoMax Watch Party', 'Big screen · Free popcorn · 12 Oct', '#141B34', '#3B2A6B', '#FF6115'),
    displayMode: 'schedule',
    startAt: '2026-10-10T00:00',
    endAt: '2026-10-12T23:59',
    clickAction: 'url',
    destinationUrl: 'https://monomax.me/watchparty',
  }),
  item('bnr', {
    name: 'Halloween Campaign',
    priority: 3,
    image: artwork('Halloween Campaign', 'Costume contest · Win prizes', '#1F1235', '#5B2A86', '#FF8A3D'),
    displayMode: 'schedule',
    startAt: '2026-10-25T00:00',
    endAt: '2026-10-31T23:59',
    clickAction: 'content',
    destinationType: 'post',
    destinationId: 'post-101',
    destinationLabel: 'Halloween Costume Contest',
  }),
  item('bnr', {
    name: 'Peep Shop Promotion',
    priority: 4,
    image: artwork('Peep Shop Promotion', 'New merch drop every Friday', '#0F766E', '#14B8A6', '#CCFBF1'),
    clickAction: 'app_page',
    destinationType: 'shop',
  }),
  item('bnr', {
    name: 'Friend Invite Promotion',
    priority: 5,
    status: 'inactive',
    image: artwork('Invite a Friend', 'Both get 100 Peep Points', '#1D4ED8', '#3B82F6', '#BFDBFE'),
    clickAction: 'app_page',
    destinationType: 'community',
  }),
  item('bnr', {
    name: 'Coupon 10% OFF',
    priority: 6,
    status: 'draft',
    image: artwork('10% OFF', 'Peep Shop coupon · until 31 Oct', '#B45309', '#F59E0B', '#FEF3C7'),
    clickAction: 'coupon',
    destinationType: 'coupon',
    destinationId: 'CP-2026-001',
    destinationLabel: '10% OFF Peep Shop',
  }),
  item('bnr', {
    name: 'Bangkok Music Festival',
    priority: 7,
    image: artwork('Bangkok Music Festival', 'Thank you for 15,000 fans!', '#141B34', '#FF6115', '#FFB38F'),
    displayMode: 'schedule',
    startAt: '2026-09-15T00:00',
    endAt: '2026-09-28T23:59',
    clickAction: 'content',
    destinationType: 'event',
    destinationId: '5931',
    destinationLabel: 'Bangkok Music Festival',
  }),
];

const coverSeed: PromoItem[] = [
  item('cvr', {
    name: 'MonoMax Watch Party 2026',
    priority: 1,
    image: artwork('Watch Party', 'MonoMax · 12 Oct', '#141B34', '#3B2A6B', '#FF6115', 'cover'),
    displayMode: 'schedule',
    startAt: '2026-10-05T00:00',
    endAt: '2026-10-15T23:59',
    showFrequency: 'once_per_day',
    clickAction: 'content',
    destinationType: 'post',
    destinationId: 'post-104',
    destinationLabel: 'Behind the scenes: MonoMax Watch Party',
  }),
  item('cvr', {
    name: 'Halloween Campaign',
    priority: 2,
    image: artwork('Halloween', 'Costume contest · win prizes', '#1F1235', '#5B2A86', '#FF8A3D', 'cover'),
    displayMode: 'schedule',
    startAt: '2026-10-25T00:00',
    endAt: '2026-10-31T23:59',
    showFrequency: 'every_open',
    clickAction: 'url',
    destinationUrl: 'https://peepshare.com/halloween',
  }),
  item('cvr', {
    name: 'Zumba Fitness',
    priority: 3,
    image: artwork('Zumba Fitness', 'Join the class · free entry', '#FF6115', '#E5540F', '#FFD9C4', 'cover'),
    showFrequency: 'once_only',
    clickAction: 'app_page',
    destinationType: 'event',
  }),
  item('cvr', {
    name: 'Friend Invite',
    priority: 4,
    status: 'inactive',
    image: artwork('Invite a Friend', 'Both get 100 Peep Points', '#1D4ED8', '#3B82F6', '#BFDBFE', 'cover'),
    showFrequency: 'once_per_day',
    clickAction: 'app_page',
    destinationType: 'community',
  }),
  item('cvr', {
    name: 'New: Photo Sync',
    priority: 5,
    status: 'draft',
    image: artwork('Photo Sync', 'Your event photos, automatically', '#0F766E', '#14B8A6', '#CCFBF1', 'cover'),
    showFrequency: 'once_only',
  }),
  item('cvr', {
    name: 'Songkran Splash Coupon',
    priority: 6,
    image: artwork('Songkran Splash', '฿100 OFF event tickets', '#0369A1', '#38BDF8', '#E0F2FE', 'cover'),
    displayMode: 'schedule',
    startAt: '2026-04-10T00:00',
    endAt: '2026-04-16T23:59',
    showFrequency: 'once_per_day',
    clickAction: 'coupon',
    destinationType: 'coupon',
    destinationId: 'CP-2026-003',
    destinationLabel: '฿100 OFF Event Ticket',
  }),
];

export interface PromoApi {
  list(): Promise<PromoItem[]>;
  /** Creates (no id match) or updates. New items go to the end of the display order. */
  save(input: PromoItem): Promise<PromoItem>;
  remove(id: string): Promise<void>;
  /** Saves the display order: ids from first to last. */
  reorder(ids: string[]): Promise<PromoItem[]>;
  uploadImage(file: File): Promise<BannerImageFile>;
}

function createPromoApi(prefix: string, seed: PromoItem[]): PromoApi {
  let store = seed;
  const sorted = () => [...store].sort((a, b) => a.priority - b.priority);
  return {
    async list() {
      await wait();
      return clone(sorted());
    },
    async save(input) {
      await wait(600);
      const exists = store.some((b) => b.id === input.id);
      const saved: PromoItem = exists ? { ...input } : { ...input, id: input.id || uid(prefix), priority: store.length + 1 };
      store = exists ? store.map((b) => (b.id === saved.id ? saved : b)) : [...store, saved];
      return clone(saved);
    },
    async remove(id) {
      await wait();
      store = sorted()
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, priority: i + 1 }));
    },
    async reorder(ids) {
      await wait(500);
      store = store.map((b) => ({ ...b, priority: ids.indexOf(b.id) + 1 }));
      return clone(sorted());
    },
    async uploadImage(file) {
      await wait(900);
      return { url: URL.createObjectURL(file), name: file.name };
    },
  };
}

export const appBannerApi = createPromoApi('bnr', bannerSeed);
export const coverPageApi = createPromoApi('cvr', coverSeed);

// --- Content & coupon search ---

export interface PickerItem {
  id: string;
  title: string;
  /** Short facts, e.g. "Event ID: 1176", "08 Oct 2026". */
  meta: string[];
  thumbnail?: string;
}

const POSTS: PickerItem[] = [
  { id: 'post-101', title: 'Halloween Costume Contest', meta: ['Post ID: 101', 'by Peep Share'] },
  { id: 'post-102', title: 'Top 10 Moments from Bangkok Music Festival', meta: ['Post ID: 102', 'by Suchadas'] },
  { id: 'post-103', title: 'How to share event photos with friends', meta: ['Post ID: 103', 'by Peep Share'] },
  { id: 'post-104', title: 'Behind the scenes: MonoMax Watch Party', meta: ['Post ID: 104', 'by Liam.R'] },
];

const COMMUNITIES: PickerItem[] = [
  { id: 'com-11', title: 'Runners Club BKK', meta: ['Community ID: 11', '2,480 members'] },
  { id: 'com-12', title: 'Photography Lovers', meta: ['Community ID: 12', '5,102 members'] },
  { id: 'com-13', title: 'K-Pop Fans TH', meta: ['Community ID: 13', '12,930 members'] },
];

const COUPONS: PickerItem[] = [
  { id: 'CP-2026-001', title: '10% OFF Peep Shop', meta: ['Coupon ID: CP-2026-001', 'Valid until 31 Oct 2026'] },
  { id: 'CP-2026-002', title: 'Free Drink at Watch Party', meta: ['Coupon ID: CP-2026-002', 'Valid until 12 Oct 2026'] },
  { id: 'CP-2026-003', title: '฿100 OFF Event Ticket', meta: ['Coupon ID: CP-2026-003', 'Valid until 30 Nov 2026'] },
  { id: 'CP-2026-004', title: 'Buy 1 Get 1 Coffee', meta: ['Coupon ID: CP-2026-004', 'Valid until 15 Dec 2026'] },
];

const match = (items: PickerItem[], query: string) => {
  const q = query.trim().toLowerCase();
  return items.filter((i) => !q || `${i.title} ${i.meta.join(' ')}`.toLowerCase().includes(q)).slice(0, 8);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const contentApi = {
  /** Events come from the Set Event list itself; posts and communities are mock. */
  async search(type: ContentType, query: string, events: SetEvent[]): Promise<PickerItem[]> {
    await wait(300);
    if (type === 'event') {
      return match(
        events
          .filter((e) => e.status !== 'Trash')
          .map((e) => {
            const [y, m, d] = e.startTime.slice(0, 10).split('-');
            return {
              id: String(e.id),
              title: e.name || 'Untitled',
              meta: [`Event ID: ${e.id}`, e.startTime ? `${d} ${MONTHS[Number(m) - 1]} ${y}` : 'No date'],
              thumbnail: e.details?.banner?.url,
            };
          }),
        query,
      );
    }
    return match(type === 'post' ? POSTS : COMMUNITIES, query);
  },
};

export const couponApi = {
  async search(query: string): Promise<PickerItem[]> {
    await wait(300);
    return match(COUPONS, query);
  },
};
