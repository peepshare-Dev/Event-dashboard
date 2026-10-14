// Activity logs for one event: who created / changed what, field by field, with the old and new value.

import { mockCollections } from '../views/Collections';
import { CURRENT_AUTHOR, type SetEvent } from './setEvents';

export type ActivityAction = 'Created' | 'Edited' | 'Status changed' | 'Moved to Trash' | 'Deleted';

export interface EventActivity {
  id: string;
  eventId: number;
  /** Local date-time, `YYYY-MM-DDTHH:mm`. */
  at: string;
  user: string;
  action: ActivityAction;
  /** Event Detail section the field belongs to, e.g. "Schedule". Empty for whole-event actions. */
  section: string;
  /** Field label, e.g. "Event start". Empty for whole-event actions. */
  field: string;
  /** Readable values; empty = not set. */
  from: string;
  to: string;
}

export const ACTIVITY_ACTIONS: ActivityAction[] = ['Created', 'Edited', 'Status changed', 'Moved to Trash', 'Deleted'];

// --- Tracked fields ---

const dateTime = (value?: string) => {
  if (!value) return '';
  const [date, time] = value.split('T');
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y} ${time ?? ''}`.trim();
};
const plain = (html?: string) => (html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const onOff = (value?: boolean) => (value === undefined ? '' : value ? 'On' : 'Off');
const collectionName = (id?: number | null) => (id == null ? '' : (mockCollections.find((c) => c.id === id)?.name ?? `Collection #${id}`));

interface TrackedField {
  section: string;
  field: string;
  value: (e: SetEvent) => string;
}

/** Every field the Event Detail page edits, in page order. */
const TRACKED: TrackedField[] = [
  { section: 'Event Information', field: 'Event name', value: (e) => e.name },
  { section: 'Event Information', field: 'Event type', value: (e) => e.details?.eventType ?? '' },
  { section: 'Event Information', field: 'Organizer', value: (e) => e.category },
  { section: 'Event Information', field: 'Description', value: (e) => plain(e.details?.description) },
  { section: 'Event Information', field: 'Banner in Event Detail', value: (e) => e.details?.banner?.name ?? '' },
  { section: 'Event Information', field: 'Banner in Card Event', value: (e) => e.details?.cardBanner?.name ?? '' },
  { section: 'Event Information', field: 'Password', value: (e) => (e.details?.password ? 'Protected' : '') },
  { section: 'Event Information', field: 'Scheduled publish', value: (e) => dateTime(e.details?.scheduledAt) },
  { section: 'Schedule', field: 'Registration opens', value: (e) => dateTime(e.details?.registrationOpensAt) },
  { section: 'Schedule', field: 'Registration closes', value: (e) => dateTime(e.details?.registrationClosesAt) },
  { section: 'Schedule', field: 'Event start', value: (e) => dateTime(e.startTime) },
  { section: 'Schedule', field: 'Event end', value: (e) => dateTime(e.endTime) },
  { section: 'Schedule', field: 'QR code expires', value: (e) => dateTime(e.details?.qrExpiresAt) },
  { section: 'Location', field: 'Event format', value: (e) => e.details?.eventFormat ?? '' },
  { section: 'Location', field: 'Venue name', value: (e) => e.details?.venueName ?? '' },
  { section: 'Location', field: 'Address', value: (e) => e.details?.address ?? '' },
  { section: 'Location', field: 'Google Maps link', value: (e) => e.details?.mapLink ?? '' },
  { section: 'Location', field: 'Online platform', value: (e) => e.details?.onlinePlatform ?? '' },
  { section: 'Location', field: 'Online link', value: (e) => e.details?.onlineUrl ?? '' },
  { section: 'Registration', field: 'Registration type', value: (e) => e.details?.registrationType ?? '' },
  { section: 'Registration', field: 'Allow join', value: (e) => onOff(e.details?.allowJoin) },
  { section: 'Registration', field: 'Max participants', value: (e) => (e.details?.maxParticipants ? String(e.details.maxParticipants) : '') },
  { section: 'Registration', field: 'Registration fee', value: (e) => (e.details?.ticketPrice ? `฿${e.details.ticketPrice.toLocaleString()}` : '') },
  { section: 'Registration', field: 'Payment methods', value: (e) => (e.details?.paymentMethods ?? []).join(', ') },
  { section: 'Collection', field: 'Collection', value: (e) => collectionName(e.details?.collectionId) },
  { section: 'Event Form', field: 'Event form', value: (e) => (e.details?.eventForm?.enabled ? e.details.eventForm.name || 'On' : '') },
  { section: 'Event Form', field: 'Form fields', value: (e) => (e.details?.eventForm?.enabled ? `${e.details.eventForm.fields.length} fields` : '') },
  { section: 'Communication', field: 'Automated messages', value: (e) => onOff(e.details?.communication?.enabled) },
  { section: 'Communication', field: 'PEEP OA ID', value: (e) => e.details?.communication?.peepOaId ?? '' },
  { section: 'Communication', field: 'Community ID', value: (e) => e.details?.communication?.communityId ?? '' },
  { section: 'Communication', field: 'Broadcast automations', value: (e) => automationsSummary(e) },
  { section: 'Survey Form', field: 'Survey form', value: (e) => (e.details?.surveyForm?.enabled ? e.details.surveyForm.name || 'On' : '') },
  { section: 'Survey Form', field: 'Survey questions', value: (e) => (e.details?.surveyForm?.enabled ? `${e.details.surveyForm.fields.length} questions` : '') },
  { section: 'Survey Form', field: 'Survey sent at', value: (e) => dateTime(e.details?.surveySendTime) },
];

function automationsSummary(e: SetEvent) {
  const list = e.details?.communication?.automations;
  if (!list?.length) return '';
  return list.map((a) => `${a.name}${a.enabled ? '' : ' (off)'}`).join(', ');
}

// --- Logging ---

let nextId = 0;
const newId = () => `activity-${Date.now().toString(36)}-${(nextId++).toString(36)}`;

const nowLocal = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Log rows for one save: "Created" for a new event, otherwise one row per changed field (plus status). */
export function diffActivity(before: SetEvent | undefined, after: SetEvent, user = CURRENT_AUTHOR, at = nowLocal()): EventActivity[] {
  const row = (action: ActivityAction, section = '', field = '', from = '', to = ''): EventActivity => ({
    id: newId(),
    eventId: after.id,
    at,
    user,
    action,
    section,
    field,
    from,
    to,
  });
  if (!before) return [row('Created', '', '', '', after.name || 'Untitled')];
  const rows: EventActivity[] = [];
  if (before.status !== after.status) {
    rows.push(row(after.status === 'Trash' ? 'Moved to Trash' : 'Status changed', 'Event Information', 'Status', before.status, after.status));
  }
  for (const t of TRACKED) {
    const from = t.value(before);
    const to = t.value(after);
    if (from !== to) rows.push(row('Edited', t.section, t.field, from, to));
  }
  return rows;
}

// --- Sample history, so every event has some activity to show ---

const PEOPLE = ['Suchadas', 'Pimchanok R.', 'Nattapong K.', 'Kanokwan S.'];

const shift = (value: string, days: number, minutes = 0) => {
  const d = new Date(`${value}:00`);
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Mock history before the event was opened here: created, then a few edits by teammates. */
export function sampleActivity(event: SetEvent): EventActivity[] {
  const start = event.startTime || '2026-09-01T10:00';
  const created = shift(start, -30);
  const editor = PEOPLE[event.id % PEOPLE.length];
  const other = PEOPLE[(event.id + 1) % PEOPLE.length];
  const row = (at: string, user: string, action: ActivityAction, section = '', field = '', from = '', to = ''): EventActivity => ({
    id: `sample-${event.id}-${at}-${field}`,
    eventId: event.id,
    at,
    user,
    action,
    section,
    field,
    from,
    to,
  });
  const rows = [
    row(created, event.author || CURRENT_AUTHOR, 'Created', '', '', '', event.name || 'Untitled'),
    row(shift(created, 0, 12), event.author || CURRENT_AUTHOR, 'Edited', 'Event Information', 'Organizer', '', event.category),
    row(shift(created, 2, 95), editor, 'Edited', 'Schedule', 'Event start', dateTime(shift(start, 7)), dateTime(start)),
    row(shift(created, 2, 96), editor, 'Edited', 'Schedule', 'Event end', dateTime(shift(event.endTime || start, 7)), dateTime(event.endTime || start)),
    row(shift(created, 5, 30), other, 'Edited', 'Location', 'Venue name', 'Impact Arena Hall 5', event.details?.venueName || 'Impact Arena Hall 9'),
    row(shift(created, 6, 10), other, 'Edited', 'Registration', 'Max participants', '300', String(event.details?.maxParticipants ?? 500)),
  ];
  if (event.status !== 'Draft') rows.push(row(shift(created, 8, 45), editor, 'Status changed', 'Event Information', 'Status', 'Pending', event.status));
  return rows;
}
