// Create / Edit Event form: state shape, mapping to/from the stored event, and validation.

import { hasOptions, isQuestion } from '../../../components/set-event/form/EventFormBuilder';
import { PEEP_OA_ID_PATTERN, defaultAutomations, normalizeOaId, type Automation } from '../../../data/automations';
import {
  CURRENT_AUTHOR,
  type EventCategory,
  type EventFormConfig,
  type EventFormField,
  type EventFormat,
  type EventType,
  type PaymentMethod,
  type RegistrationType,
  type SetEvent,
  type SetEventStatus,
} from '../../../data/setEvents';

export interface FormState {
  // Event Information
  name: string;
  eventType: EventType | '';
  category: EventCategory | '';
  description: string;
  banner: { url: string; name: string } | null;
  cardBanner: { url: string; name: string } | null;
  // Schedule
  regOpenDate: string;
  regOpenTime: string;
  regCloseDate: string;
  regCloseTime: string;
  eventStartDate: string;
  eventStartTime: string;
  eventEndDate: string;
  eventEndTime: string;
  qrDate: string;
  qrTime: string;
  // Location
  eventFormat: EventFormat | '';
  venueName: string;
  address: string;
  latitude: string;
  longitude: string;
  mapLink: string;
  onlinePlatform: string;
  onlineUrl: string;
  accessInstructions: string;
  // Registration
  registrationType: RegistrationType | '';
  allowJoin: boolean;
  capacityLimited: boolean;
  maxParticipants: string;
  ticketPrice: string;
  paymentMethods: PaymentMethod[];
  // Event Form
  requireForm: boolean;
  formName: string;
  formDescription: string;
  formFields: EventFormField[];
  /** Master template the Event Form was copied from. */
  formTemplateId: string;
  /** Legacy template names; kept as saved, no longer edited here. */
  registrationForms: string[];
  // Communication
  communicationEnabled: boolean;
  peepOaId: string;
  communityId: string;
  automations: Automation[];
  // Survey Form
  requireSurvey: boolean;
  surveyName: string;
  surveyDescription: string;
  surveyFields: EventFormField[];
  surveyTemplateId: string;
  surveyDate: string;
  surveyTime: string;
  // Collection
  collectionId: number | null;
  // Status & visibility panel
  status: SetEventStatus;
  scheduledDate: string;
  scheduledTime: string;
  passwordEnabled: boolean;
  password: string;
}

/** Inline error messages, keyed by field (form builder fields use `field:<id>`). */
export type Errors = Record<string, string | undefined>;

export interface SectionProps {
  form: FormState;
  patch: (changes: Partial<FormState>) => void;
  errors: Errors;
}

export const datePart = (value = '') => value.slice(0, 10);
export const timePart = (value = '') => value.slice(11, 16);
export const joinDateTime = (date: string, time: string) => (date && time ? `${date}T${time}` : '');
const numberText = (n: number | null | undefined) => (n == null ? '' : String(n));
const toNumber = (value: string) => (value.trim() === '' ? null : Number(value));

export const hasPhysicalLocation = (format: FormState['eventFormat']) => format === 'Offline' || format === 'Hybrid';
export const hasOnlineLocation = (format: FormState['eventFormat']) => format === 'Online' || format === 'Hybrid';

export function toForm(event?: SetEvent): FormState {
  const d = event?.details;
  // Older events only stored a one-day registration window (registrationStart / End).
  const regOpens = d?.registrationOpensAt || d?.registrationStart;
  const regCloses = d?.registrationClosesAt || d?.registrationEnd;
  const hadLocation = Boolean(d?.latitude || d?.longitude || d?.mapLink);
  return {
    name: event?.name ?? '',
    eventType: d?.eventType ?? '',
    category: event?.category ?? '',
    description: d?.description ?? '',
    banner: d?.banner ?? null,
    cardBanner: d?.cardBanner ?? null,
    regOpenDate: datePart(regOpens),
    regOpenTime: timePart(regOpens),
    regCloseDate: datePart(regCloses),
    regCloseTime: timePart(regCloses),
    eventStartDate: datePart(event?.startTime),
    eventStartTime: timePart(event?.startTime),
    eventEndDate: datePart(event?.endTime),
    eventEndTime: timePart(event?.endTime),
    qrDate: datePart(d?.qrExpiresAt),
    qrTime: timePart(d?.qrExpiresAt),
    eventFormat: d?.eventFormat ?? (hadLocation ? 'Offline' : ''),
    venueName: d?.venueName ?? '',
    address: d?.address ?? '',
    latitude: d?.latitude ?? '',
    longitude: d?.longitude ?? '',
    mapLink: d?.mapLink ?? '',
    onlinePlatform: d?.onlinePlatform ?? '',
    onlineUrl: d?.onlineUrl ?? '',
    accessInstructions: d?.accessInstructions ?? '',
    // Existing events only knew Free / Paid tickets.
    registrationType: d?.registrationType ?? (event ? event.ticketType : ''),
    allowJoin: d?.allowJoin ?? true,
    capacityLimited: d?.maxParticipants != null,
    maxParticipants: numberText(d?.maxParticipants),
    ticketPrice: numberText(d?.ticketPrice),
    paymentMethods: d?.paymentMethods ?? ['PromptPay'],
    requireForm: d?.eventForm?.enabled ?? Boolean(d?.registrationForms.length),
    formName: d?.eventForm?.name ?? '',
    formDescription: d?.eventForm?.description ?? '',
    formFields: d?.eventForm?.fields ?? [],
    formTemplateId: d?.eventForm?.templateId ?? '',
    registrationForms: d?.registrationForms ?? [],
    // New events start with suggested automations, switched off until Communication is enabled.
    communicationEnabled: d?.communication?.enabled ?? false,
    peepOaId: d?.communication?.peepOaId ?? '',
    communityId: d?.communication?.communityId ?? '',
    automations: d?.communication?.automations ?? defaultAutomations(),
    // Events that already had a send time were sending a survey.
    requireSurvey: d?.surveyForm?.enabled ?? Boolean(d?.surveySendTime),
    surveyName: d?.surveyForm?.name ?? '',
    surveyDescription: d?.surveyForm?.description ?? '',
    surveyFields: d?.surveyForm?.fields ?? [],
    surveyTemplateId: d?.surveyForm?.templateId ?? '',
    surveyDate: datePart(d?.surveySendTime),
    surveyTime: timePart(d?.surveySendTime),
    collectionId: d?.collectionId ?? null,
    status: event?.status ?? 'Draft',
    scheduledDate: datePart(d?.scheduledAt),
    scheduledTime: timePart(d?.scheduledAt),
    passwordEnabled: Boolean(d?.password),
    password: d?.password ?? '',
  };
}

export function fromForm(form: FormState, base: SetEvent | undefined, id: number, status: SetEventStatus): SetEvent {
  const physical = hasPhysicalLocation(form.eventFormat);
  const online = hasOnlineLocation(form.eventFormat);
  const type = form.registrationType;
  const regOpens = joinDateTime(form.regOpenDate, form.regOpenTime);
  const regCloses = joinDateTime(form.regCloseDate, form.regCloseTime);
  return {
    id,
    name: form.name.trim(),
    author: base?.author ?? CURRENT_AUTHOR,
    category: form.category,
    registrants: base?.registrants ?? 0,
    status,
    // The Event List still filters on Free / Paid.
    ticketType: type === 'Paid' ? 'Paid' : type ? 'Free' : (base?.ticketType ?? 'Free'),
    startTime: joinDateTime(form.eventStartDate, form.eventStartTime),
    endTime: joinDateTime(form.eventEndDate, form.eventEndTime),
    details: {
      // Keep fields this form doesn't edit (e.g. QR links).
      ...base?.details,
      eventType: form.eventType,
      description: form.description,
      banner: form.banner,
      cardBanner: form.cardBanner,
      registrationOpensAt: regOpens,
      registrationClosesAt: regCloses,
      // Mirrored for screens that still read the older one-day window.
      registrationStart: regOpens,
      registrationEnd: regCloses,
      qrExpiresAt: joinDateTime(form.qrDate, form.qrTime),
      surveySendTime: form.requireSurvey ? joinDateTime(form.surveyDate, form.surveyTime) : '',
      // Only the fields that apply to the chosen format / registration type are kept.
      eventFormat: form.eventFormat,
      venueName: physical ? form.venueName.trim() : '',
      address: physical ? form.address.trim() : '',
      latitude: physical ? form.latitude.trim() : '',
      longitude: physical ? form.longitude.trim() : '',
      mapLink: physical ? form.mapLink.trim() : '',
      onlinePlatform: online ? form.onlinePlatform : '',
      onlineUrl: online ? form.onlineUrl.trim() : '',
      accessInstructions: online ? form.accessInstructions.trim() : '',
      registrationType: type,
      allowJoin: form.allowJoin,
      maxParticipants: type && form.capacityLimited ? toNumber(form.maxParticipants) : null,
      ticketPrice: type === 'Paid' ? toNumber(form.ticketPrice) : null,
      paymentMethods: type === 'Paid' ? form.paymentMethods : [],
      eventForm: formConfig(form.requireForm, form.formName, form.formDescription, form.formFields, form.formTemplateId),
      communication: { enabled: form.communicationEnabled, peepOaId: normalizeOaId(form.peepOaId), communityId: normalizeOaId(form.communityId), automations: form.automations },
      surveyForm: formConfig(form.requireSurvey, form.surveyName, form.surveyDescription, form.surveyFields, form.surveyTemplateId),
      registrationForms: form.registrationForms,
      collectionId: form.collectionId,
      scheduledAt: status === 'Scheduled' ? joinDateTime(form.scheduledDate, form.scheduledTime) : '',
      password: form.passwordEnabled ? form.password.trim() : '',
    },
  };
}

export function formConfig(enabled: boolean, name: string, description: string, fields: EventFormField[], templateId = ''): EventFormConfig {
  return {
    enabled,
    ...(templateId && { templateId }),
    name: name.trim(),
    description: description.trim(),
    fields: fields.map((field) => ({
      ...field,
      label: field.label.trim(),
      // Section headings are never answered.
      required: isQuestion(field) && field.required,
      options: hasOptions(field.type) ? field.options.map((o) => o.trim()).filter(Boolean) : [],
    })),
  };
}

// --- Validation ---

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Pulls `lat,lng` out of common Google Maps URL shapes (`@lat,lng`, `?q=lat,lng`, `!3dlat!4dlng`). */
export function coordsFromMapLink(link: string): { latitude: string; longitude: string } | null {
  const num = '(-?\\d{1,3}(?:\\.\\d+)?)';
  const patterns = [new RegExp(`!3d${num}!4d${num}`), new RegExp(`@${num},${num}`), new RegExp(`[?&](?:q|query|ll|destination)=${num},\\s*${num}`)];
  let decoded = link;
  try {
    decoded = decodeURIComponent(link);
  } catch {
    // Malformed escapes: match against the raw text.
  }
  for (const pattern of patterns) {
    const m = decoded.match(pattern);
    if (m) return { latitude: m[1], longitude: m[2] };
  }
  return null;
}

export function validateUrl(value: string): string | undefined {
  if (!value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol === 'http:' || url.protocol === 'https:') return undefined;
  } catch {
    // fall through
  }
  return 'Enter a valid link, starting with https://';
}

function validateCoordinate(value: string, limit: number, label: string): string | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || Math.abs(n) > limit) return `${label} must be a number between -${limit} and ${limit}.`;
  return undefined;
}

function validateCount(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? undefined : 'Enter a whole number greater than 0.';
}

/**
 * Drafts only need well-formed values (`complete` = false).
 * Create Event / Submit to Review / non-draft saves also need everything marked required.
 */
export function validate(form: FormState, complete: boolean): Errors {
  const physical = hasPhysicalLocation(form.eventFormat);
  const online = hasOnlineLocation(form.eventFormat);
  const type = form.registrationType;
  const errors: Errors = {};

  // Schedule
  const eventStart = joinDateTime(form.eventStartDate, form.eventStartTime);
  const eventEnd = joinDateTime(form.eventEndDate, form.eventEndTime);
  if (eventStart && eventEnd && eventEnd <= eventStart) errors.eventEnd = 'The event must end after it starts.';
  const regOpen = joinDateTime(form.regOpenDate, form.regOpenTime || '00:00');
  const regClose = joinDateTime(form.regCloseDate, form.regCloseTime || '23:59');
  if (form.regOpenDate && form.regCloseDate && regClose <= regOpen) errors.regPeriod = 'Registration must close after it opens.';
  else if (form.regCloseTime && eventEnd && joinDateTime(form.regCloseDate, form.regCloseTime) > eventEnd) errors.regPeriod = 'Registration must close before the event ends.';

  // Location
  if (physical) {
    errors.latitude = validateCoordinate(form.latitude, 90, 'Latitude');
    errors.longitude = validateCoordinate(form.longitude, 180, 'Longitude');
    errors.mapLink = validateUrl(form.mapLink);
  }
  if (online) errors.onlineUrl = validateUrl(form.onlineUrl);

  // Communication
  if (form.communicationEnabled && form.peepOaId.trim() && !PEEP_OA_ID_PATTERN.test(form.peepOaId.trim()))
    errors.peepOaId = 'Use lowercase letters, numbers and hyphens, e.g. #oa-mono-max-official-account.';
  if (form.communicationEnabled && form.communityId.trim() && !PEEP_OA_ID_PATTERN.test(form.communityId.trim()))
    errors.communityId = 'Use lowercase letters, numbers and hyphens, e.g. #oa-mono-max-official-account.';

  // Registration
  if (type && form.capacityLimited) errors.maxParticipants = validateCount(form.maxParticipants);
  if (type === 'Paid' && form.ticketPrice.trim()) {
    const price = Number(form.ticketPrice);
    if (!Number.isFinite(price) || price <= 0) errors.ticketPrice = 'Enter a fee greater than 0.';
  }

  // Status & visibility
  if (form.status === 'Scheduled') {
    const at = joinDateTime(form.scheduledDate, form.scheduledTime);
    if (!at) errors.schedule = 'Choose the date and time to publish.';
    else if (at <= nowLocal()) errors.schedule = 'Choose a date and time in the future.';
  }
  if (form.passwordEnabled && form.password.trim().length < 4) errors.password = 'Use at least 4 characters.';

  if (complete) {
    if (!form.name.trim()) errors.name = 'Enter an event name.';
    if (!form.eventType) errors.eventType = 'Select the event type.';
    if (!form.category) errors.category = 'Select an organizer.';

    if (!form.eventStartDate || !form.eventStartTime) errors.eventStart = 'Set the start date and time.';
    if (!form.eventEndDate || !form.eventEndTime) errors.eventEnd ??= 'Set the end date and time.';

    if (!form.eventFormat) errors.eventFormat = 'Select the event format.';
    if (physical && !form.venueName.trim()) errors.venueName = 'Enter the venue name.';
    if (online && !form.onlineUrl.trim()) errors.onlineUrl ??= 'Enter the link attendees use to join.';

    if (!type) errors.registrationType = 'Select how attendees register.';
    if (type && form.capacityLimited && !form.maxParticipants.trim()) errors.maxParticipants = 'Enter the maximum number of participants.';
    if (type === 'Paid') {
      if (!form.ticketPrice.trim()) errors.ticketPrice = 'Enter the registration fee.';
      if (form.paymentMethods.length === 0) errors.paymentMethods = 'Select at least one payment method.';
    }

    if (form.requireForm) {
      if (!form.formName.trim()) errors.formName = 'Enter a form name.';
      if (!form.formFields.some(isQuestion)) errors.formFields = 'Add at least one field.';
      validateFields(form.formFields, errors);
    }
    if (form.requireSurvey) {
      if (!form.surveyName.trim()) errors.surveyName = 'Enter a survey name.';
      if (!form.surveyFields.some(isQuestion)) errors.surveyFields = 'Add at least one question.';
      if (!form.surveyDate || !form.surveyTime) errors.surveySend = 'Set when the survey is sent.';
      validateFields(form.surveyFields, errors);
    }
    if (form.communicationEnabled && !form.peepOaId.trim()) errors.peepOaId = 'Enter the PEEP OA ID that sends these messages.';
  }

  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
}

/** Builder field errors are keyed by field id, so the Event and Survey forms can share one error map. */
export function validateFields(fields: EventFormField[], errors: Errors) {
  for (const field of fields) {
    if (!field.label.trim()) errors[`field:${field.id}`] = field.type === 'heading' ? 'Enter a section title.' : 'Enter a label for this field.';
    if (hasOptions(field.type) && !field.options.some((o) => o.trim())) errors[`field:${field.id}:options`] = 'Add at least one option.';
  }
}

// --- Section progress (section menu and Create Event steps) ---

export type SectionId = 'information' | 'schedule' | 'location' | 'registration' | 'collection' | 'event-form' | 'communication' | 'survey-form';

/** error = a shown error inside; todo = required fields still empty; done = complete; undefined = optional and switched off. */
export type SectionStatus = 'error' | 'todo' | 'done' | undefined;

const ERROR_SECTION: Record<string, SectionId> = {
  name: 'information',
  eventType: 'information',
  category: 'information',
  // Status & visibility opens from the Event Information header.
  schedule: 'information',
  password: 'information',
  eventStart: 'schedule',
  eventEnd: 'schedule',
  regPeriod: 'schedule',
  eventFormat: 'location',
  venueName: 'location',
  latitude: 'location',
  longitude: 'location',
  mapLink: 'location',
  onlineUrl: 'location',
  registrationType: 'registration',
  maxParticipants: 'registration',
  ticketPrice: 'registration',
  paymentMethods: 'registration',
  formName: 'event-form',
  formFields: 'event-form',
  surveyName: 'survey-form',
  surveyFields: 'survey-form',
  surveySend: 'survey-form',
  peepOaId: 'communication',
  communityId: 'communication',
};

/** Which section an error key belongs to. Builder errors (`field:<id>`) belong to whichever form holds that field. */
export function errorSection(key: string, form: FormState): SectionId | undefined {
  if (key.startsWith('field:')) {
    const id = key.split(':')[1];
    return form.formFields.some((f) => f.id === id) ? 'event-form' : 'survey-form';
  }
  return ERROR_SECTION[key];
}

export function sectionStatuses(form: FormState, shownErrors: Errors): Record<SectionId, SectionStatus> {
  const sectionsOf = (errors: Errors) => new Set(Object.keys(errors).map((k) => errorSection(k, form)));
  const shown = sectionsOf(shownErrors);
  const missing = sectionsOf(validate(form, true));
  const status = (id: SectionId, enabled = true): SectionStatus =>
    shown.has(id) ? 'error' : !enabled ? undefined : missing.has(id) ? 'todo' : 'done';
  return {
    information: status('information'),
    schedule: status('schedule'),
    location: status('location'),
    registration: status('registration'),
    collection: status('collection', form.collectionId !== null),
    'event-form': status('event-form', form.requireForm),
    communication: status('communication', form.communicationEnabled),
    'survey-form': status('survey-form', form.requireSurvey),
  };
}
