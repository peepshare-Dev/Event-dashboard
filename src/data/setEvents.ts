// Set Event service — event data source.
// Everything the Event List needs (search, filters, tabs, pagination) runs through the
// pure helpers below, so the seed array can later be swapped for an API response.

import bangkokBanner from '../assets/banners/bangkok-music-festival.svg';
import neonBanner from '../assets/banners/neon-city-jazz-night.svg';
import sunsetBanner from '../assets/banners/sunset-groove-gala.svg';
import pulseBanner from '../assets/banners/electric-pulse-festival.svg';
import midnightBanner from '../assets/banners/midnight-harmony-bash.svg';
import lunarBanner from '../assets/banners/lunar-beats-carnival.svg';
import type { CommunicationSettings } from './automations';

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
  /** Wide banner used on event cards (2:1). */
  cardBanner?: { url: string; name: string } | null;
  latitude: string;
  longitude: string;
  /** Google Maps link for the venue. */
  mapLink?: string;
  /** Local date-times, `YYYY-MM-DDTHH:mm` (empty when not set) */
  registrationStart: string;
  registrationEnd: string;
  /** Multi-day registration window, `YYYY-MM-DDTHH:mm` (empty when not set) */
  registrationOpensAt?: string;
  registrationClosesAt?: string;
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
  /** What kind of event this is. */
  eventType?: EventType | '';
  /** Where it happens — decides which location fields apply. */
  eventFormat?: EventFormat | '';
  venueName?: string;
  address?: string;
  onlinePlatform?: string;
  onlineUrl?: string;
  accessInstructions?: string;
  /** How attendees join — decides which registration settings apply. */
  registrationType?: RegistrationType | '';
  /** null = unlimited */
  maxParticipants?: number | null;
  /** THB; Paid registration only */
  ticketPrice?: number | null;
  paymentMethods?: PaymentMethod[];
  /** Custom questions attendees answer when registering. */
  eventForm?: EventFormConfig;
  /** Feedback questions sent to attendees at `surveySendTime`. */
  surveyForm?: EventFormConfig;
  /** Automated PEEP OA messages (Communication). */
  communication?: CommunicationSettings;
}

export type EventType =
  | 'Concert'
  | 'Festival'
  | 'Conference'
  | 'Seminar'
  | 'Workshop'
  | 'Sports'
  | 'Competition'
  | 'Exhibition'
  | 'Casting / Audition'
  | 'Community / Meetup'
  | 'Campaign'
  | 'Corporate Event'
  | 'Other';
export type EventFormat = 'Offline' | 'Online' | 'Hybrid';
export type RegistrationType = 'Free' | 'Paid';
export type PaymentMethod = 'PromptPay' | 'Credit / Debit Card' | 'Bank Transfer';
export type FormFieldType =
  | 'short-text'
  | 'long-text'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'single-choice'
  | 'multiple-choice'
  | 'dropdown'
  | 'file';

export interface EventFormField {
  id: string;
  label: string;
  description: string;
  type: FormFieldType;
  required: boolean;
  /** Choice / dropdown fields only */
  options: string[];
}

export interface EventFormConfig {
  enabled: boolean;
  /** Master template this form was copied from (Regis Form / Survey Form menu). */
  templateId?: string;
  name: string;
  description: string;
  fields: EventFormField[];
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
    mapLink: '',
    registrationStart: '',
    registrationEnd: '',
    registrationOpensAt: '',
    registrationClosesAt: '',
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

export const EVENT_TYPES: EventType[] = [
  'Concert',
  'Festival',
  'Conference',
  'Seminar',
  'Workshop',
  'Sports',
  'Competition',
  'Exhibition',
  'Casting / Audition',
  'Community / Meetup',
  'Campaign',
  'Corporate Event',
  'Other',
];

export const REGISTRATION_TYPE_LABELS: Record<RegistrationType, string> = {
  Free: 'Free Registration',
  Paid: 'Paid Registration',
};

export const PAYMENT_METHODS: PaymentMethod[] = ['PromptPay', 'Credit / Debit Card', 'Bank Transfer'];

export const ONLINE_PLATFORMS = ['Zoom', 'Google Meet', 'Microsoft Teams', 'YouTube Live', 'Facebook Live', 'Other'];

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
      registrationForms: [],
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

// Sample Regis / Survey forms so the form list pages have content.
const field = (id: string, label: string, type: FormFieldType, required = true, options: string[] = []): EventFormField => ({
  id,
  label,
  description: '',
  type,
  required,
  options,
});
const RATING = ['1', '2', '3', '4', '5'];

const SAMPLE_FORMS: Record<number, Partial<SetEventDetails>> = {
  5931: {
    eventForm: {
      enabled: true,
      templateId: 'tpl-concert',
      name: 'Festival Registration',
      description: 'Tell us a little about yourself before the festival.',
      fields: [
        field('f-5931-1', 'Full Name', 'short-text'),
        field('f-5931-2', 'Email', 'email'),
        field('f-5931-3', 'Phone Number', 'phone'),
        field('f-5931-4', 'Ticket Zone', 'dropdown', true, ['GA', 'VIP', 'Backstage']),
      ],
    },
    surveyForm: {
      enabled: true,
      templateId: 'tpl-satisfaction',
      name: 'Post-festival Feedback',
      description: 'Thank you for joining! Help us make next year even better.',
      fields: [
        field('s-5931-1', 'How satisfied were you with the festival overall?', 'single-choice', true, RATING),
        field('s-5931-2', 'Which stage did you enjoy most?', 'dropdown', false, ['Main Stage', 'Forest Stage', 'Club Tent']),
        field('s-5931-3', 'What could we improve?', 'long-text', false),
      ],
    },
    surveySendTime: '2026-09-29T10:00',
  },
  4827: {
    eventForm: {
      enabled: true,
      name: 'Jazz Night Sign-up',
      description: '',
      fields: [field('f-4827-1', 'Full Name', 'short-text'), field('f-4827-2', 'Seats', 'number'), field('f-4827-3', 'Dietary Needs', 'long-text', false)],
    },
    surveyForm: {
      enabled: true,
      templateId: 'tpl-quick',
      name: 'Jazz Night Feedback',
      description: '',
      fields: [field('s-4827-1', 'Rate the performance', 'single-choice', true, RATING), field('s-4827-2', 'Comments', 'long-text', false)],
    },
  },
  7394: {
    eventForm: {
      enabled: true,
      name: 'Gala Invitation RSVP',
      description: 'Please confirm your attendance by 25 September.',
      fields: [
        field('f-7394-1', 'Full Name', 'short-text'),
        field('f-7394-2', 'Email', 'email'),
        field('f-7394-3', 'Bringing a guest?', 'single-choice', true, ['Yes', 'No']),
        field('f-7394-4', 'Guest Name', 'short-text', false),
        field('f-7394-5', 'Dietary Requirements', 'multiple-choice', false, ['Vegetarian', 'Vegan', 'Halal', 'No seafood']),
      ],
    },
    surveyForm: {
      enabled: true,
      name: 'Gala Evening Survey',
      description: 'Thank you for celebrating with us.',
      fields: [
        field('s-7394-1', 'How was the evening overall?', 'single-choice', true, RATING),
        field('s-7394-2', 'How was the food & drinks?', 'single-choice', true, RATING),
        field('s-7394-3', 'Any message for the organizers?', 'long-text', false),
      ],
    },
    surveySendTime: '2026-10-01T09:00',
  },
  8249: {
    eventForm: {
      enabled: false,
      name: 'Harmony Bash Early Access',
      description: 'Early-access sign-up (closed).',
      fields: [field('f-8249-1', 'Full Name', 'short-text'), field('f-8249-2', 'Email', 'email'), field('f-8249-3', 'Date of Birth', 'date')],
    },
    surveyForm: {
      enabled: true,
      name: 'Midnight Harmony Feedback',
      description: '',
      fields: [
        field('s-8249-1', 'Rate the line-up', 'single-choice', true, RATING),
        field('s-8249-2', 'Which artist would you like to see next year?', 'short-text', false),
        field('s-8249-3', 'Would you come again?', 'single-choice', true, ['Yes', 'Maybe', 'No']),
      ],
    },
    surveySendTime: '2026-10-03T12:00',
  },
  6512: {
    surveyForm: {
      enabled: true,
      name: 'Electric Pulse Crew Survey',
      description: 'For volunteers and crew after the festival.',
      fields: [
        field('s-6512-1', 'How well were you briefed before your shift?', 'single-choice', true, RATING),
        field('s-6512-2', 'Would you volunteer again?', 'single-choice', true, ['Yes', 'No']),
        field('s-6512-3', 'Suggestions for next time', 'long-text', false),
      ],
    },
    surveySendTime: '2026-10-02T10:00',
    eventForm: {
      enabled: true,
      templateId: 'tpl-volunteer',
      name: 'Volunteer Application',
      description: 'Apply to join the Electric Pulse crew.',
      fields: [
        field('f-6512-1', 'Full Name', 'short-text'),
        field('f-6512-2', 'Age', 'number'),
        field('f-6512-3', 'Available Days', 'multiple-choice', true, ['Day 1', 'Day 2']),
        field('f-6512-4', 'Portfolio / CV', 'file', false),
      ],
    },
  },
  3906: {
    eventForm: {
      enabled: true,
      name: 'Carnival Entry Pass',
      description: 'Register each member of your group for an entry wristband.',
      fields: [
        field('f-3906-1', 'Full Name', 'short-text'),
        field('f-3906-2', 'Group Size', 'number'),
        field('f-3906-3', 'Arrival Day', 'single-choice', true, ['Friday', 'Saturday', 'Sunday']),
      ],
    },
    surveyForm: {
      enabled: false,
      name: 'Carnival Quick Rating',
      description: '',
      fields: [field('s-3906-1', 'Rate this event', 'single-choice', true, RATING)],
    },
  },
};

// Forms for the generated events, picked by what kind of event it is.
type FieldSpec = [label: string, type: FormFieldType, required?: boolean, options?: string[]];
const REGIS_BY_KIND: { match: string[]; suffix: string; description: string; fields: FieldSpec[]; templateId?: string }[] = [
  {
    match: ['Fun Run'],
    suffix: 'Runner Registration',
    description: 'Race kit pick-up details will be sent after you register.',
    fields: [['Full Name', 'short-text'], ['Age', 'number'], ['Shirt Size', 'dropdown', true, ['S', 'M', 'L', 'XL']], ['Emergency Contact', 'phone']],
  },
  {
    match: ['Tech Meetup', 'Live Session'],
    suffix: 'Sign-up',
    description: '',
    fields: [['Full Name', 'short-text'], ['Email', 'email'], ['Company', 'short-text', false], ['Job Title', 'short-text', false]],
  },
  {
    match: ['Workshop', 'Wellness Expo'],
    suffix: 'Booking',
    templateId: 'tpl-workshop',
    description: 'Seats are limited — book your spot.',
    fields: [['Full Name', 'short-text'], ['Email', 'email'], ['Experience Level', 'single-choice', true, ['Beginner', 'Intermediate', 'Advanced']], ['Anything we should know?', 'long-text', false]],
  },
  {
    match: ['Food Fair', 'Art Market', 'Night Market', 'Book Fest'],
    suffix: 'Vendor Application',
    description: 'Apply for a booth. We’ll confirm within 3 working days.',
    fields: [['Shop Name', 'short-text'], ['Contact Person', 'short-text'], ['Phone Number', 'phone'], ['Product Category', 'dropdown', true, ['Food', 'Drinks', 'Crafts', 'Fashion', 'Other']], ['Product Photos', 'file', false]],
  },
  {
    match: ['Career Day'],
    suffix: 'Candidate Registration',
    description: '',
    fields: [['Full Name', 'short-text'], ['Email', 'email'], ['University', 'short-text'], ['Fields of Interest', 'multiple-choice', true, ['Engineering', 'Marketing', 'Finance', 'Design']], ['Resume', 'file', false]],
  },
  {
    match: [],
    suffix: 'Registration',
    templateId: 'tpl-standard',
    description: '',
    fields: [['Full Name', 'short-text'], ['Email', 'email'], ['Phone Number', 'phone']],
  },
];

const SURVEY_KINDS: { suffix: string; templateId: string; fields: FieldSpec[] }[] = [
  { suffix: 'Feedback', templateId: 'tpl-satisfaction', fields: [['How satisfied were you overall?', 'single-choice', true, RATING], ['What did you enjoy most?', 'long-text', false], ['Would you recommend it to a friend?', 'single-choice', true, ['Yes', 'Maybe', 'No']]] },
  { suffix: 'Session Rating', templateId: 'tpl-session', fields: [['Rate the speaker', 'single-choice', true, RATING], ['How useful was the content?', 'single-choice', true, RATING], ['Topics for next time', 'long-text', false]] },
  { suffix: 'Satisfaction Survey', templateId: 'tpl-venue', fields: [['Overall rating', 'single-choice', true, RATING], ['Venue & facilities', 'single-choice', true, RATING], ['Comments', 'long-text', false]] },
  { suffix: 'Quick Poll', templateId: 'tpl-quick', fields: [['Rate this event', 'single-choice', true, RATING], ['Would you join again?', 'single-choice', true, ['Yes', 'No']]] },
];

const toFields = (prefix: string, specs: FieldSpec[]) => specs.map(([label, type, required = true, options = []], n) => field(`${prefix}-${n + 1}`, label, type, required, options));

/** Adds a Regis form to every 3rd generated event and a survey to every 4th; a few are switched off. */
function withGeneratedForms(event: SetEvent, i: number): SetEvent {
  const patch: Partial<SetEventDetails> = {};
  if (i % 3 === 0) {
    const kind = REGIS_BY_KIND.find((k) => k.match.some((m) => event.name.endsWith(m))) ?? REGIS_BY_KIND[REGIS_BY_KIND.length - 1];
    patch.eventForm = {
      enabled: i % 9 !== 6,
      templateId: kind.templateId,
      name: `${event.name} ${kind.suffix}`,
      description: kind.description,
      fields: toFields(`f-${event.id}`, kind.fields),
    };
  }
  if (i % 4 === 1) {
    const kind = SURVEY_KINDS[Math.floor(i / 4) % SURVEY_KINDS.length];
    patch.surveyForm = { enabled: i % 12 !== 5, templateId: kind.templateId, name: `${event.name} ${kind.suffix}`, description: '', fields: toFields(`s-${event.id}`, kind.fields) };
    // Next morning at 10:00.
    const next = new Date(`${event.endTime.slice(0, 10)}T00:00`);
    next.setDate(next.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    patch.surveySendTime = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T10:00`;
  }
  return Object.keys(patch).length ? withDetails(event, patch) : event;
}

export const setEventsSeed: SetEvent[] = [
  ...featuredEvents.map((e) =>
    SAMPLE_BANNERS[e.id] || SAMPLE_FORMS[e.id] ? withDetails(e, { ...(SAMPLE_BANNERS[e.id] && { banner: SAMPLE_BANNERS[e.id] }), ...SAMPLE_FORMS[e.id] }) : e,
  ),
  ...generateEvents(94).map(withGeneratedForms),
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
