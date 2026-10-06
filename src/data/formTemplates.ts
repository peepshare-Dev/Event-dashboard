// Master Regis / Survey form templates. Events copy a template into their own Event Form or
// Survey Form (remembering `templateId`), so editing a template never changes an event's copy.

import type { EventFormField, FormFieldType } from './setEvents';

export type FormKind = 'registration' | 'survey';

export interface FormTemplate {
  id: string;
  kind: FormKind;
  name: string;
  description: string;
  fields: EventFormField[];
  /** Local date-time, `YYYY-MM-DDTHH:mm` */
  updatedAt: string;
  updatedBy: string;
}

let nextId = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(nextId++).toString(36)}`;
export const newTemplateId = () => uid('tpl');

/** Fresh field ids, so a copy can be edited without touching the original. */
export const cloneFields = (fields: EventFormField[]): EventFormField[] => fields.map((f) => ({ ...f, id: uid('field'), options: [...f.options] }));

type Spec = [label: string, type: FormFieldType, required?: boolean, options?: string[]];
const RATING = ['1', '2', '3', '4', '5'];

function template(id: string, kind: FormKind, name: string, description: string, specs: Spec[], updatedAt: string, updatedBy = 'Suchadas'): FormTemplate {
  return {
    id,
    kind,
    name,
    description,
    fields: specs.map(([label, type, required = true, options = []], i) => ({ id: `${id}-${i + 1}`, label, description: '', type, required, options })),
    updatedAt,
    updatedBy,
  };
}

export const formTemplatesSeed: FormTemplate[] = [
  // Registration
  template('tpl-standard', 'registration', 'Standard Registration', 'Name and contact details for any event.', [['Full Name', 'short-text'], ['Email', 'email'], ['Phone Number', 'phone']], '2026-09-02T10:15'),
  template(
    'tpl-concert',
    'registration',
    'Concert Ticket Registration',
    'For concerts and festivals with ticket zones.',
    [['Full Name', 'short-text'], ['Email', 'email'], ['Phone Number', 'phone'], ['Ticket Zone', 'dropdown', true, ['GA', 'VIP', 'Backstage']]],
    '2026-09-10T14:40',
    'Liam.R',
  ),
  template(
    'tpl-workshop',
    'registration',
    'Workshop Sign-up',
    'Seat booking with experience level.',
    [['Full Name', 'short-text'], ['Email', 'email'], ['Experience Level', 'single-choice', true, ['Beginner', 'Intermediate', 'Advanced']], ['Anything we should know?', 'long-text', false]],
    '2026-09-12T09:05',
  ),
  template(
    'tpl-casting',
    'registration',
    'Casting / Audition Application',
    'Applicants submit details and a portfolio for review.',
    [['Full Name', 'short-text'], ['Age', 'number'], ['Phone Number', 'phone'], ['Portfolio', 'file', false]],
    '2026-09-18T16:20',
    'Ava.M',
  ),
  template(
    'tpl-volunteer',
    'registration',
    'Volunteer Application',
    '',
    [['Full Name', 'short-text'], ['Phone Number', 'phone'], ['Available Days', 'multiple-choice', true, ['Day 1', 'Day 2']], ['Why do you want to join?', 'long-text', false]],
    '2026-09-20T11:00',
  ),
  template(
    'tpl-staff',
    'registration',
    'Staff Check-in Form',
    'Internal form for crew and staff on event day.',
    [['Staff Name', 'short-text'], ['Staff ID', 'short-text'], ['Team', 'dropdown', true, ['Front of House', 'Stage', 'Security', 'Media']], ['Shift', 'single-choice', true, ['Morning', 'Afternoon', 'Night']]],
    '2026-09-25T08:30',
    'Noah.K',
  ),
  // Survey
  template(
    'tpl-satisfaction',
    'survey',
    'Post-event Feedback',
    'General satisfaction survey sent after the event.',
    [['How satisfied were you overall?', 'single-choice', true, RATING], ['What did you enjoy most?', 'long-text', false], ['Would you recommend it to a friend?', 'single-choice', true, ['Yes', 'Maybe', 'No']]],
    '2026-09-05T13:00',
  ),
  template(
    'tpl-session',
    'survey',
    'Session Feedback',
    'Rate a talk, class or session.',
    [['Rate the speaker', 'single-choice', true, RATING], ['How useful was the content?', 'single-choice', true, RATING], ['Topics for next time', 'long-text', false]],
    '2026-09-14T10:45',
    'Emma.J',
  ),
  template('tpl-quick', 'survey', 'Quick Rating', 'Two questions, under a minute.', [['Rate this event', 'single-choice', true, RATING], ['Would you join again?', 'single-choice', true, ['Yes', 'No']]], '2026-09-21T17:10'),
  template(
    'tpl-venue',
    'survey',
    'Venue & Facilities Survey',
    '',
    [['Overall rating', 'single-choice', true, RATING], ['Venue & facilities', 'single-choice', true, RATING], ['Food & drinks', 'single-choice', false, RATING], ['Comments', 'long-text', false]],
    '2026-09-28T15:30',
    'Mason.T',
  ),
];
