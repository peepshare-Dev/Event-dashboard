// Promotional placements in the Peep Share app, sharing one model:
// - Banner (Set Banner in App): promotional banner inside the app.
// - Cover Page (Set Cover Page in App): popup / interstitial when the user opens the app,
//   which adds a Show Frequency.
// WHAT (name + image) → WHEN (display period) → [FREQUENCY] → ACTION (click action + destination)
// → PRIORITY (order) → STATUS (configured status + schedule).

export type BannerStatus = 'active' | 'inactive' | 'draft';
/** What admins see: the configured status combined with the display period. */
export type BannerDisplayStatus = 'Active' | 'Scheduled' | 'Draft' | 'Inactive' | 'Expired';
export type DisplayMode = 'always' | 'schedule';
export type ClickAction = 'none' | 'url' | 'app_page' | 'content' | 'coupon';
export type ContentType = 'event' | 'post' | 'community';
/** Cover Page only: how often the same user sees it. */
export type ShowFrequency = 'every_open' | 'once_per_day' | 'once_only';

export interface BannerImageFile {
  url: string;
  name: string;
}

/** Shared by Banner and Cover Page. */
export interface PromoItem {
  id: string;
  name: string;
  image: BannerImageFile | null;
  status: BannerStatus;
  displayMode: DisplayMode;
  /** Local date-times `YYYY-MM-DDTHH:mm`; empty when displayMode is `always`. */
  startAt: string;
  endAt: string;
  clickAction: ClickAction;
  /**
   * app_page → page id · content → content type · coupon → 'coupon' · otherwise ''.
   */
  destinationType: string;
  /** content → content id · coupon → coupon id · otherwise ''. */
  destinationId: string;
  /** Snapshot of the linked item's title, so lists don't need a lookup. */
  destinationLabel: string;
  /** url only */
  destinationUrl: string;
  /** 1 = shown first. */
  priority: number;
  createdAt: string;
  updatedAt: string;
  /** Cover Page only. */
  showFrequency?: ShowFrequency;
}

export type AppBanner = PromoItem;
export type CoverPage = PromoItem & { showFrequency: ShowFrequency };

// --- Config ---

export const CLICK_ACTIONS: { value: ClickAction; label: string; description: string; icon: string }[] = [
  { value: 'none', label: 'No Action', description: 'Display the banner without navigation.', icon: 'solar:forbidden-circle-linear' },
  { value: 'url', label: 'External URL', description: 'Open an external website.', icon: 'solar:link-linear' },
  { value: 'app_page', label: 'App Page', description: 'Navigate to a page inside Peep Share.', icon: 'solar:smartphone-linear' },
  { value: 'content', label: 'Content', description: 'Open a specific content item.', icon: 'solar:document-text-linear' },
  { value: 'coupon', label: 'Coupon', description: 'Open a specific coupon.', icon: 'solar:sale-linear' },
];
export const clickActionLabel = (a: ClickAction) => CLICK_ACTIONS.find((c) => c.value === a)?.label ?? a;

/**
 * App pages a banner can open. No route list exists in this project yet — replace with the
 * Peep Share app's supported deep links when the API provides them.
 */
export const APP_PAGES: { value: string; label: string; icon: string }[] = [
  { value: 'community', label: 'Community', icon: 'solar:users-group-rounded-linear' },
  { value: 'my_cloud', label: 'My Cloud', icon: 'solar:cloud-linear' },
  { value: 'shop', label: 'Shop', icon: 'solar:shop-linear' },
  { value: 'event', label: 'Event', icon: 'solar:calendar-linear' },
  { value: 'coupon_wallet', label: 'Coupon Wallet', icon: 'solar:wallet-linear' },
];
export const appPageLabel = (v: string) => APP_PAGES.find((p) => p.value === v)?.label ?? v;

export const CONTENT_TYPES: { value: ContentType; label: string; icon: string }[] = [
  { value: 'event', label: 'Event', icon: 'solar:calendar-linear' },
  { value: 'post', label: 'Post', icon: 'solar:notes-linear' },
  { value: 'community', label: 'Community', icon: 'solar:users-group-rounded-linear' },
];
export const contentTypeLabel = (v: string) => CONTENT_TYPES.find((c) => c.value === v)?.label ?? v;

export const BANNER_IMAGE_SIZE = '1432 × 480 px';
/** No Cover Page spec exists in this project yet; a 3:4 portrait popup is assumed. */
export const COVER_IMAGE_SIZE = '1080 × 1440 px';

export const SHOW_FREQUENCIES: { value: ShowFrequency; label: string; description: string; icon: string }[] = [
  { value: 'every_open', label: 'Every app open', description: 'Show the Cover Page every time the user opens the app.', icon: 'solar:restart-linear' },
  { value: 'once_per_day', label: 'Once per day', description: 'Show the Cover Page at most once per day for each user.', icon: 'solar:calendar-mark-linear' },
  { value: 'once_only', label: 'Once only', description: 'Show the Cover Page only once for each user.', icon: 'solar:check-circle-linear' },
];
export const showFrequencyLabel = (v?: ShowFrequency) => SHOW_FREQUENCIES.find((f) => f.value === v)?.label ?? '—';

// --- Logic ---

export function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Draft / Inactive come from the configured status; an active banner is Scheduled, Active or Expired by its dates. */
export function displayStatus(b: Pick<AppBanner, 'status' | 'displayMode' | 'startAt' | 'endAt'>, now = nowLocal()): BannerDisplayStatus {
  if (b.status === 'draft') return 'Draft';
  if (b.status === 'inactive') return 'Inactive';
  if (b.displayMode === 'schedule') {
    if (b.startAt && now < b.startAt) return 'Scheduled';
    if (b.endAt && now > b.endAt) return 'Expired';
  }
  return 'Active';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2026-10-08` → `08 Oct 2026` */
export function formatDay(value: string) {
  if (!value) return '—';
  const [y, m, d] = value.slice(0, 10).split('-');
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function describePeriod(b: Pick<AppBanner, 'displayMode' | 'startAt' | 'endAt'>) {
  if (b.displayMode === 'always') return 'Always';
  return `${formatDay(b.startAt)} - ${formatDay(b.endAt)}`;
}

/** Plain-language click behaviour, e.g. "Content · Event → Watch Party 2026". */
export function describeClick(b: Pick<AppBanner, 'clickAction' | 'destinationType' | 'destinationLabel' | 'destinationUrl'>) {
  switch (b.clickAction) {
    case 'url':
      return b.destinationUrl ? `External URL → ${b.destinationUrl}` : 'External URL';
    case 'app_page':
      return b.destinationType ? `App Page → ${appPageLabel(b.destinationType)}` : 'App Page';
    case 'content':
      return `${b.destinationType ? contentTypeLabel(b.destinationType) : 'Content'}${b.destinationLabel ? ` → ${b.destinationLabel}` : ''}`;
    case 'coupon':
      return `Coupon${b.destinationLabel ? ` → ${b.destinationLabel}` : ''}`;
    default:
      return 'No Action';
  }
}

/** Is it on screen at any point within [from, to] (`YYYY-MM-DD`, either may be empty)? */
export function overlapsPeriod(b: Pick<AppBanner, 'displayMode' | 'startAt' | 'endAt'>, from: string, to: string) {
  if (b.displayMode === 'always' || (!from && !to)) return true;
  const start = b.startAt.slice(0, 10);
  const end = b.endAt.slice(0, 10);
  return (!to || start <= to) && (!from || end >= from);
}
