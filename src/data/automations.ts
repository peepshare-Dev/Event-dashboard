// Event Communication — automated PEEP OA messages (WHEN trigger → WAIT delay → THEN send).
// Triggers, channels, message types and variables are config lists, so new ones are added here.

export type TriggerType = 'after_registration' | 'after_checkin' | 'before_event' | 'after_event' | 'specific_datetime';
export type DelayUnit = 'minutes' | 'hours' | 'days';
export type ChannelId = 'peep_oa';
export type MessageType = 'text' | 'image' | 'claim' | 'event_card' | 'coupon' | 'link';

export interface MessageImage {
  url: string;
  name: string;
}

/**
 * Claim Gift: the attendee taps `image` → `url` opens in a webview → when they close it,
 * PEEP OA replies with `claimedImage` and `claimedText` to confirm the gift was claimed.
 */
export interface ClaimMessage {
  image: MessageImage | null;
  url: string;
  claimedImage: MessageImage | null;
  claimedText: string;
}

/** One chat bubble. Only the payload for `type` is set. */
export interface MessageContent {
  type: MessageType;
  text?: string;
  image?: MessageImage | null;
  claim?: ClaimMessage;
}

/** Messages sent together in one broadcast (PEEP OA limit per send). */
export const MAX_MESSAGES = 5;

export interface Automation {
  id: string;
  /** Admin-only name, never shown to attendees. */
  name: string;
  enabled: boolean;
  trigger: {
    type: TriggerType;
    /** value 0 = immediately. For `before_event` it counts back from the event start. */
    delay: { value: number; unit: DelayUnit };
    /** `specific_datetime` only — local `YYYY-MM-DDTHH:mm`. */
    sendAt?: string;
  };
  channel: ChannelId;
  /** Sent together, in this order (1 to MAX_MESSAGES). */
  messages: MessageContent[];
}

export interface CommunicationSettings {
  enabled: boolean;
  /** PEEP Official Account the messages are sent from, e.g. `#oa-mono-max-official-account`. */
  peepOaId?: string;
  /** PEEP Community linked to the event, e.g. `#community-mono-max`. Same format as the OA ID. */
  communityId?: string;
  automations: Automation[];
}

/** Lowercase letters, numbers and hyphens, with or without the leading `#`. */
export const PEEP_OA_ID_PATTERN = /^#?[a-z0-9][a-z0-9-]*$/;

/** Stored with the leading `#`. */
export const normalizeOaId = (value: string) => {
  const id = value.trim().replace(/^#/, '');
  return id ? `#${id}` : '';
};

// --- Config ---

export interface TriggerDefinition {
  type: TriggerType;
  label: string;
  description: string;
  icon: string;
  /** How the WAIT step works for this trigger. */
  timing: 'after' | 'before' | 'datetime';
  /** Completes "1 hour …", e.g. "after check-in". */
  relation: string;
}

export const TRIGGERS: TriggerDefinition[] = [
  {
    type: 'after_registration',
    label: 'After Registration',
    description: 'When an attendee completes registration.',
    icon: 'solar:user-check-linear',
    timing: 'after',
    relation: 'after registration',
  },
  {
    type: 'before_event',
    label: 'Before Event',
    description: 'A set time before the event starts.',
    icon: 'solar:alarm-linear',
    timing: 'before',
    relation: 'before the event starts',
  },
  {
    type: 'after_checkin',
    label: 'After Check-in',
    description: 'When staff scan the attendee’s QR code at the venue.',
    icon: 'solar:qr-code-linear',
    timing: 'after',
    relation: 'after check-in',
  },
  {
    type: 'after_event',
    label: 'After Event',
    description: 'Once the event has ended.',
    icon: 'solar:flag-linear',
    timing: 'after',
    relation: 'after the event ends',
  },
  {
    type: 'specific_datetime',
    label: 'Specific Date & Time',
    description: 'Send to all registered attendees at a set time.',
    icon: 'solar:calendar-mark-linear',
    timing: 'datetime',
    relation: '',
  },
];

export const triggerDef = (type: TriggerType) => TRIGGERS.find((t) => t.type === type)!;

export const DELAY_UNITS: { value: DelayUnit; label: string }[] = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
];

export const CHANNELS: { id: ChannelId; label: string; description: string; icon: string }[] = [
  { id: 'peep_oa', label: 'PEEP OA', description: 'Chat message from the PEEP Official Account.', icon: 'solar:chat-round-dots-linear' },
];

export const channelLabel = (id: ChannelId) => CHANNELS.find((c) => c.id === id)?.label ?? id;

export const MESSAGE_TYPES: { id: MessageType; label: string; icon: string; available: boolean }[] = [
  { id: 'text', label: 'Text', icon: 'solar:text-field-linear', available: true },
  { id: 'image', label: 'Image', icon: 'solar:gallery-wide-linear', available: true },
  { id: 'claim', label: 'Claim Gift', icon: 'solar:gift-linear', available: true },
  { id: 'event_card', label: 'Event Card', icon: 'solar:ticket-linear', available: false },
  { id: 'coupon', label: 'Coupon', icon: 'solar:sale-linear', available: false },
  { id: 'link', label: 'Link', icon: 'solar:link-linear', available: false },
];

export const messageTypeLabel = (id: MessageType) => MESSAGE_TYPES.find((m) => m.id === id)?.label ?? id;

export interface MessageVariable {
  key: string;
  label: string;
  /** Mock value for previews. */
  sample: string;
}

export const MESSAGE_VARIABLES: MessageVariable[] = [
  { key: 'user_name', label: 'Attendee name', sample: 'Suchada' },
  { key: 'event_name', label: 'Event name', sample: 'Bangkok Music Festival' },
  { key: 'event_date', label: 'Event date', sample: '28 Sep 2026' },
  { key: 'event_time', label: 'Event time', sample: '10:00' },
  { key: 'event_location', label: 'Event location', sample: 'Impact Arena' },
  { key: 'qr_code', label: 'QR code link', sample: 'peepshare.com/qr/A7K2' },
  { key: 'registration_id', label: 'Registration ID', sample: 'REG-000128' },
];

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

/** Replaces `{{key}}` with the given values (unknown keys stay as written). */
export function fillVariables(text: string, values: Record<string, string>) {
  return text.replace(VARIABLE_PATTERN, (match, key: string) => values[key] ?? match);
}

/** Splits text into plain parts and variable keys, for rendering variables as chips. */
export function splitVariables(text: string): ({ text: string } | { variable: string })[] {
  const parts: ({ text: string } | { variable: string })[] = [];
  let last = 0;
  for (const m of text.matchAll(VARIABLE_PATTERN)) {
    if (m.index! > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ variable: m[1] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** Translator passed in from components (`useT()`); defaults to English with `{placeholder}` filling. */
export type Translate = (text: string, vars?: Record<string, string | number>) => string;

const fillPlaceholders: Translate = (text, vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match)) : text;

const UNIT_KEYS: Record<DelayUnit, [string, string]> = {
  minutes: ['{count} minute', '{count} minutes'],
  hours: ['{count} hour', '{count} hours'],
  days: ['{count} day', '{count} days'],
};

const unitLabel = (value: number, unit: DelayUnit, t: Translate) => t(UNIT_KEYS[unit][value === 1 ? 0 : 1], { count: value });

/** "Immediately", "1 hour later", "1 day before event", "28-09-2026 at 18:00". */
export function describeTiming(trigger: Automation['trigger'], t: Translate = fillPlaceholders): string {
  const def = triggerDef(trigger.type);
  if (def.timing === 'datetime') {
    if (!trigger.sendAt) return t('Date not set');
    const [date, time] = trigger.sendAt.split('T');
    const [y, m, d] = date.split('-');
    return t('{date} at {time}', { date: `${d}-${m}-${y}`, time });
  }
  if (def.timing === 'before') return t('{duration} before event', { duration: unitLabel(trigger.delay.value, trigger.delay.unit, t) });
  return trigger.delay.value === 0 ? t('Immediately') : t('{duration} later', { duration: unitLabel(trigger.delay.value, trigger.delay.unit, t) });
}

/** Full sentence for previews: "Sent 1 hour after check-in", "Sent immediately after registration". */
export function describeSchedule(trigger: Automation['trigger'], t: Translate = fillPlaceholders): string {
  const def = triggerDef(trigger.type);
  if (def.timing === 'datetime') return t('Sent on {when}', { when: describeTiming(trigger, t) });
  if (def.timing === 'after' && trigger.delay.value === 0) return t('Sent immediately {relation}', { relation: t(def.relation) });
  return t('Sent {duration} {relation}', { duration: unitLabel(trigger.delay.value, trigger.delay.unit, t), relation: t(def.relation) });
}

let nextId = 0;
export const newAutomationId = () => `automation-${Date.now().toString(36)}-${(nextId++).toString(36)}`;

/** Suggested automations a new event starts with (switched off until Communication is enabled). */
export function defaultAutomations(): Automation[] {
  return [
    {
      id: newAutomationId(),
      name: 'Registration Confirmation',
      enabled: true,
      trigger: { type: 'after_registration', delay: { value: 0, unit: 'minutes' } },
      channel: 'peep_oa',
      messages: [{ type: 'text', text: '🎉 Registration confirmed!\n\nYou’re registered for {{event_name}}.\n\nSee you at the event!' }],
    },
    {
      id: newAutomationId(),
      name: 'Check-in Welcome',
      enabled: true,
      trigger: { type: 'after_checkin', delay: { value: 0, unit: 'minutes' } },
      channel: 'peep_oa',
      messages: [{ type: 'text', text: '🎉 Welcome to {{event_name}}!\n\nEnjoy the event and have a great time!' }],
    },
    {
      id: newAutomationId(),
      name: 'Special Event Promotion',
      enabled: true,
      trigger: { type: 'after_checkin', delay: { value: 1, unit: 'hours' } },
      channel: 'peep_oa',
      messages: [
        { type: 'text', text: '🎁 Special Offer!\n\nEnjoy an exclusive offer available during today’s event.\n\nView the offer: https://peepshare.com/offers' },
      ],
    },
  ];
}
