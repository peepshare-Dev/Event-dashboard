// Set Event service — event data source.
// Everything the Event List needs (search, filters, tabs, pagination) runs through the
// pure helpers below, so the seed array can later be swapped for an API response.

import bangkokBanner from '../assets/banners/bangkok-music-festival.svg';
import neonBanner from '../assets/banners/neon-city-jazz-night.svg';
import sunsetBanner from '../assets/banners/sunset-groove-gala.svg';
import pulseBanner from '../assets/banners/electric-pulse-festival.svg';
import midnightBanner from '../assets/banners/midnight-harmony-bash.svg';
import lunarBanner from '../assets/banners/lunar-beats-carnival.svg';

export type SetEventStatus = 'Published' | 'Pending' | 'Scheduled' | 'Draft' | 'Private' | 'Trash';
export type TicketType = 'Free' | 'Paid';
export type EventCategory = 'MONO' | 'JAS' | 'HR' | 'LXL' | 'other';

export interface SetEvent {
  id: number;
  name: string;
  author: string;
  /** Empty while a draft has no category yet */
  category: EventCategory | '';
  registrants: number;
  status: SetEventStatus;
  ticketType: TicketType;
  /** Local date-time, `YYYY-MM-DDTHH:mm` */
  startTime: string;
  /** Local date-time, `YYYY-MM-DDTHH:mm` */
  endTime: string;
  /** Optional detail captured by the Create / Edit Event page. */
  details?: SetEventDetails;
}

export interface SetEventDetails {
  /** Rich-text HTML from the description editor */
  description: string;
  banner: { url: string; name: string } | null;
  latitude: string;
  longitude: string;
  /** Local date-times, `YYYY-MM-DDTHH:mm` (empty when not set) */
  registrationStart: string;
  registrationEnd: string;
  surveySendTime: string;
  qrExpiresAt: string;
  allowJoin: boolean;
  registrationForms: string[];
  collectionId: number | null;
  /** Local date-time the event auto-publishes, when status is Scheduled */
  scheduledAt: string;
  /** Empty when the event page is not password protected. Mock only — hash server-side in production. */
  password: string;
  /** Shareable links with QR codes (QR Code / Scanner). */
  qrLinks?: QrLink[];
}

export interface QrLink {
  id: string;
  name: string;
  url: string;
  /** Local date-time, `YYYY-MM-DDTHH:mm` */
  createdAt: string;
}

export function emptyDetails(): SetEventDetails {
  return {
    description: '',
    banner: null,
    latitude: '',
    longitude: '',
    registrationStart: '',
    registrationEnd: '',
    surveySendTime: '',
    qrExpiresAt: '',
    allowJoin: true,
    registrationForms: [],
    collectionId: null,
    scheduledAt: '',
    password: '',
    qrLinks: [],
  };
}

/** Returns a copy of the event with some detail fields changed (creating details if needed). */
export function withDetails(event: SetEvent, patch: Partial<SetEventDetails>): SetEvent {
  return { ...event, details: { ...(event.details ?? emptyDetails()), ...patch } };
}

export const CURRENT_AUTHOR = 'Suchadas';

export const EVENT_CATEGORIES: EventCategory[] = ['MONO', 'JAS', 'HR', 'LXL', 'other'];
export const TICKET_TYPES: TicketType[] = ['Free', 'Paid'];
export const EDITABLE_STATUSES: SetEventStatus[] = ['Draft', 'Pending', 'Private', 'Scheduled', 'Published'];

// Registration form templates that can be attached to an event.
export const REGISTRATION_FORM_TEMPLATES = [
  'Standard Registration',
  'Concert Ticket Registration',
  'Workshop Sign-up',
  'Staff Check-in Form',
];

// --- Seed data ---

const featuredEvents: SetEvent[] = [
  { id: 5931, name: 'Bangkok Music Festival', author: 'Suchadas', category: 'MONO', registrants: 15, status: 'Published', ticketType: 'Free', startTime: '2026-09-28T10:00', endTime: '2026-09-28T10:00' },
  {
    id: 4827, name: 'Neon City Jazz Night', author: 'Liam.R', category: 'JAS', registrants: 16, status: 'Draft', ticketType: 'Paid', startTime: '2026-09-29T11:15', endTime: '2026-09-29T11:15',
    // A draft that's already been filled in, ready to review and publish.
    details: {
      description: '<p>An evening of <b>live jazz</b> under the city lights, featuring local and international trios.</p><ul><li>Doors open 18:00</li><li>Food &amp; drinks available on site</li></ul>',
      banner: null,
      latitude: '13.7466',
      longitude: '100.5393',
      registrationStart: '2026-09-20T09:00',
      registrationEnd: '2026-09-20T23:00',
      surveySendTime: '2026-09-30T10:00',
      qrExpiresAt: '2026-09-30T23:59',
      allowJoin: true,
      registrationForms: ['Concert Ticket Registration'],
      collectionId: 1,
      scheduledAt: '',
      password: '',
      qrLinks: [
        { id: 'qr-4827-1', name: 'Registration page', url: 'https://peepshare.com/e/4827/register', createdAt: '2026-09-18T10:12' },
        { id: 'qr-4827-2', name: 'Check-in scanner', url: 'https://peepshare.com/e/4827/check-in', createdAt: '2026-09-19T14:30' },
        { id: 'qr-4827-3', name: 'Post-event survey', url: 'https://peepshare.com/e/4827/survey', createdAt: '2026-09-21T09:05' },
      ],
    },
  },
  { id: 7394, name: 'Sunset Groove Gala', author: 'Ava.M', category: 'other', registrants: 17, status: 'Private', ticketType: 'Free', startTime: '2026-09-30T09:30', endTime: '2026-09-30T09:30' },
  { id: 6512, name: 'Electric Pulse Festival', author: 'Noah.K', category: 'HR', registrants: 18, status: 'Published', ticketType: 'Paid', startTime: '2026-10-01T14:45', endTime: '2026-10-01T14:45' },
  { id: 8249, name: 'Midnight Harmony Bash', author: 'Emma.J', category: 'LXL', registrants: 19, status: 'Published', ticketType: 'Free', startTime: '2026-10-02T16:50', endTime: '2026-10-02T16:50' },
  { id: 3906, name: 'Lunar Beats Carnival', author: 'Mason.T', category: 'JAS', registrants: 20, status: 'Published', ticketType: 'Free', startTime: '2026-10-03T08:20', endTime: '2026-10-03T08:20' },
];

// Deterministic filler so pagination has realistic volume without random reshuffles on reload.
function generateEvents(count: number): SetEvent[] {
  const adjectives = ['Golden', 'Riverside', 'Urban', 'Starlight', 'Tropical', 'Velvet', 'Crystal', 'Summit', 'Harbor', 'Echo', 'Aurora', 'Retro'];
  const nouns = ['Food Fair', 'Tech Meetup', 'Art Market', 'Fun Run', 'Film Night', 'Career Day', 'Wellness Expo', 'Book Fest', 'Live Session', 'Workshop', 'Showcase', 'Night Market'];
  const authors = ['Suchadas', 'Suchadas', 'Suchadas', 'Liam.R', 'Ava.M', 'Noah.K', 'Emma.J', 'Mason.T'];
  const statuses: SetEventStatus[] = ['Published', 'Published', 'Published', 'Draft', 'Private'];

  const pad = (n: number) => String(n).padStart(2, '0');
  const baseDate = new Date(2026, 9, 4); // 4 Oct 2026

  return Array.from({ length: count }, (_, i) => {
    const day = new Date(baseDate);
    day.setDate(baseDate.getDate() + Math.floor(i / 2));
    const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    const startHour = 8 + ((i * 3) % 10);
    const minutes = pad((i * 15) % 60);

    return {
      id: 1000 + ((i * 7919) % 9000),
      name: `${adjectives[i % adjectives.length]} ${nouns[(i * 5) % nouns.length]}`,
      author: authors[(i * 3) % authors.length],
      category: EVENT_CATEGORIES[i % EVENT_CATEGORIES.length],
      registrants: 10 + ((i * 37) % 290),
      status: statuses[(i * 7) % statuses.length],
      ticketType: i % 3 === 0 ? 'Paid' : 'Free',
      startTime: `${date}T${pad(startHour)}:${minutes}`,
      endTime: `${date}T${pad(startHour + 2)}:${minutes}`,
    };
  });
}

// Sample banners (local SVGs) so the Banner image page and event pages have artwork.
const SAMPLE_BANNERS: Record<number, { url: string; name: string }> = {
  5931: { url: bangkokBanner, name: 'bangkok-music-festival.svg' },
  4827: { url: neonBanner, name: 'neon-city-jazz-night.svg' },
  7394: { url: sunsetBanner, name: 'sunset-groove-gala.svg' },
  6512: { url: pulseBanner, name: 'electric-pulse-festival.svg' },
  8249: { url: midnightBanner, name: 'midnight-harmony-bash.svg' },
  3906: { url: lunarBanner, name: 'lunar-beats-carnival.svg' },
};

export const setEventsSeed: SetEvent[] = [
  ...featuredEvents.map((e) => (SAMPLE_BANNERS[e.id] ? withDetails(e, { banner: SAMPLE_BANNERS[e.id] }) : e)),
  ...generateEvents(94),
];

// --- Query helpers ---

export type EventTab = 'All' | 'Mine' | 'Published' | 'Draft' | 'Private' | 'Trash';
export const EVENT_TABS: EventTab[] = ['All', 'Mine', 'Published', 'Draft', 'Private', 'Trash'];

export interface EventQuery {
  tab: EventTab;
  search: string;
  ticketType: TicketType | 'All';
  status: SetEventStatus | 'All';
  /** `YYYY-MM-DD`, inclusive */
  startDate: string;
  /** `YYYY-MM-DD`, inclusive */
  endDate: string;
}

function matchesTab(event: SetEvent, tab: EventTab): boolean {
  // Trashed events only appear in the Trash tab.
  if (tab === 'Trash') return event.status === 'Trash';
  if (event.status === 'Trash') return false;
  if (tab === 'All') return true;
  if (tab === 'Mine') return event.author === CURRENT_AUTHOR;
  return event.status === tab;
}

export function countByTab(events: SetEvent[]): Record<EventTab, number> {
  return Object.fromEntries(
    EVENT_TABS.map((tab) => [tab, events.filter((e) => matchesTab(e, tab)).length]),
  ) as Record<EventTab, number>;
}

export function queryEvents(events: SetEvent[], query: EventQuery): SetEvent[] {
  const term = query.search.trim().toLowerCase();

  return events.filter((e) => {
    if (!matchesTab(e, query.tab)) return false;
    if (query.ticketType !== 'All' && e.ticketType !== query.ticketType) return false;
    if (query.status !== 'All' && e.status !== query.status) return false;

    // Keep events whose schedule overlaps the selected date range.
    if (query.startDate && e.endTime.slice(0, 10) < query.startDate) return false;
    if (query.endDate && e.startTime.slice(0, 10) > query.endDate) return false;

    if (term) {
      const haystack = `${e.id} ${e.name} ${e.author} ${e.category}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

export type SortKey = 'id' | 'name' | 'author' | 'category' | 'registrants' | 'status' | 'startTime' | 'endTime';
export type SortState = { key: SortKey; dir: 'asc' | 'desc' } | null;

export function sortEvents(events: SetEvent[], sort: SortState): SetEvent[] {
  if (!sort) return events;
  const factor = sort.dir === 'asc' ? 1 : -1;
  return [...events].sort((a, b) => {
    const x = a[sort.key];
    const y = b[sort.key];
    const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
    return cmp * factor;
  });
}

/** `2026-09-28T10:00` → `28-09-2026 at 10:00` */
export function formatEventDateTime(value: string): string {
  if (!value) return '—';
  const [date, time] = value.split('T');
  const [y, m, d] = date.split('-');
  return `${d}-${m}-${y} at ${time}`;
}
