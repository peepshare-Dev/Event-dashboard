import { useState } from 'react';
import { Icon } from '@iconify/react';
import Drawer from '../../ui/Drawer';
import Button from '../../ui/Button';
import FormField, { inputClass } from '../form/FormField';
import SelectField from '../form/SelectField';
import TimingSelector, { type TimingValue } from './TimingSelector';
import MessageEditor from './MessageEditor';
import MessagePreview, { type PreviewContent } from './MessagePreview';
import {
  CHANNELS,
  MAX_MESSAGES,
  MESSAGE_TYPES,
  TRIGGERS,
  describeSchedule,
  newAutomationId,
  triggerDef,
  type Automation,
  type ChannelId,
  type MessageContent,
  type TriggerType,
} from '../../../data/automations';
import { useT } from '@/i18n';

interface Draft {
  name: string;
  enabled: boolean;
  trigger: TriggerType | '';
  timing: TimingValue;
  channel: ChannelId;
  messages: DraftMessage[];
}

/** `key` keeps React state stable while messages are added, moved or removed. */
type DraftMessage = PreviewContent & { key: string };


const EMPTY_CLAIM: PreviewContent['claim'] = { image: null, url: '', claimedImage: null, claimedText: '' };

let nextMessageKey = 0;

// Every type keeps its own draft, so switching type doesn't lose what was written.
const toDraftMessage = (m?: MessageContent): DraftMessage => ({
  key: `message-${nextMessageKey++}`,
  type: m?.type ?? 'text',
  text: m?.text ?? '',
  image: m?.image ?? null,
  claim: m?.claim ?? EMPTY_CLAIM,
});

const toMessage = ({ type, text, image, claim }: DraftMessage): MessageContent =>
  type === 'image' ? { type, image } : type === 'claim' ? { type, claim } : { type, text };

/** Errors for message `i`, with the `messages.i.` prefix removed (keys MessageEditor expects). */
const messageErrors = (errors: Record<string, string>, i: number) =>
  Object.fromEntries(
    Object.entries(errors)
      .filter(([k]) => k.startsWith(`messages.${i}.`))
      .map(([k, v]) => [k.slice(`messages.${i}.`.length), v]),
  );

function toDraft(a?: Automation): Draft {
  const delay = a?.trigger.delay;
  return {
    name: a?.name ?? '',
    enabled: a?.enabled ?? true,
    trigger: a?.trigger.type ?? '',
    timing: {
      mode: delay && delay.value > 0 ? 'delay' : 'immediate',
      value: delay && delay.value > 0 ? String(delay.value) : '',
      unit: delay?.unit ?? 'hours',
      date: a?.trigger.sendAt?.slice(0, 10) ?? '',
      time: a?.trigger.sendAt?.slice(11, 16) ?? '',
    },
    channel: a?.channel ?? 'peep_oa',
    messages: a?.messages.length ? a.messages.map(toDraftMessage) : [toDraftMessage()],
  };
}

function toTrigger(draft: Draft): Automation['trigger'] {
  const type = draft.trigger as TriggerType;
  const timing = triggerDef(type).timing;
  if (timing === 'datetime') return { type, delay: { value: 0, unit: 'minutes' }, sendAt: `${draft.timing.date}T${draft.timing.time}` };
  const delayed = timing === 'before' || draft.timing.mode === 'delay';
  return { type, delay: delayed ? { value: Number(draft.timing.value), unit: draft.timing.unit } : { value: 0, unit: 'minutes' } };
}

function fromDraft(draft: Draft, id: string): Automation {
  return {
    id,
    name: draft.name.trim(),
    enabled: draft.enabled,
    trigger: toTrigger(draft),
    channel: draft.channel,
    messages: draft.messages.map(toMessage),
  };
}

function validateDraft(draft: Draft) {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = 'Enter an automation name.';
  if (!draft.trigger) errors.trigger = 'Select when this message is sent.';
  else {
    const timing = triggerDef(draft.trigger).timing;
    if (timing === 'datetime' && (!draft.timing.date || !draft.timing.time)) errors.timing = 'Choose the date and time to send.';
    if ((timing === 'before' || (timing === 'after' && draft.timing.mode === 'delay')) && !(Number(draft.timing.value) > 0))
      errors.timing = 'Enter a delay greater than 0.';
  }
  if (!draft.channel) errors.channel = 'Select a channel.';
  draft.messages.forEach(({ type, text, image, claim }, i) => {
    const key = (field: string) => `messages.${i}.${field}`;
    if (type === 'text' && !text.trim()) errors[key('text')] = 'Write the message.';
    if (type === 'image' && !image) errors[key('image')] = 'Upload an image.';
    // Claim Gift only works when all fields are filled.
    if (type === 'claim') {
      if (!claim.image) errors[key('claimImage')] = 'Upload the giveaway image.';
      if (!/^https?:\/\/\S+$/.test(claim.url.trim())) errors[key('claimUrl')] = 'Enter a valid link, starting with https://';
      if (!claim.claimedImage) errors[key('claimedImage')] = 'Upload the claimed image.';
      if (!claim.claimedText.trim()) errors[key('claimedText')] = 'Write the message sent after claiming.';
    }
  });
  return errors;
}

const triggerOptions = TRIGGERS.map((t) => ({ value: t.type, label: t.label, icon: t.icon }));

interface AutomationEditorProps {
  /** Omit to add a new automation. */
  automation?: Automation;
  /** Mock values for `{{variables}}` in the preview. */
  previewValues: Record<string, string>;
  /** PEEP OA ID shown as the sender in the preview. */
  accountId?: string;
  onSave: (automation: Automation) => void;
  onClose: () => void;
}

// Add / edit one automation: WHEN (trigger) → WAIT (timing) → THEN (channel + message), with a live preview.
export default function AutomationEditor({ automation, previewValues, accountId, onSave, onClose }: AutomationEditorProps) {
  const t = useT();
  const [draft, setDraft] = useState<Draft>(() => toDraft(automation));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (submitted) setErrors(validateDraft(next));
  };

  const setMessage = (i: number, patch: Partial<PreviewContent>) =>
    update({ messages: draft.messages.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  const moveMessage = (i: number, to: number) => {
    const messages = [...draft.messages];
    [messages[i], messages[to]] = [messages[to], messages[i]];
    update({ messages });
  };
  const removeMessage = (i: number) => update({ messages: draft.messages.filter((_, j) => j !== i) });
  const addMessage = () => update({ messages: [...draft.messages, toDraftMessage()] });

  const def = draft.trigger ? triggerDef(draft.trigger) : undefined;
  const caption = def && !validateDraft(draft).timing ? describeSchedule(toTrigger(draft), t) : undefined;

  const save = () => {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>('[data-automation-editor] [aria-invalid="true"]');
        // Scroll only the drawer body, never the Create Event page behind it.
        const scroller = target?.closest<HTMLElement>('.overflow-y-auto');
        if (target && scroller) {
          const offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientHeight / 3;
          scroller.scrollBy({ top: offset, behavior: 'smooth' });
        }
        target?.focus({ preventScroll: true });
      });
      return;
    }
    onSave(fromDraft(draft, automation?.id ?? newAutomationId()));
  };

  return (
    <Drawer
      title={automation ? t('Edit Broadcast Automation') : t('Add Broadcast Automation')}
      description={t('Set when and what message should be sent to attendees.')}
      onClose={onClose}
      maxWidth="sm:max-w-[1040px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="h-11 sm:h-10">
            {t('Cancel')}
          </Button>
          <Button onClick={save} className="h-11 sm:h-10 sm:px-5">
            {t('Save Automation')}
          </Button>
        </>
      }
    >
      <div data-automation-editor className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="px-4 sm:px-6 py-6 space-y-8 min-w-0">
          <FormField label={t('Automation Name')} required hint={t('Only admins see this name. Attendees never do.')} error={errors.name && t(errors.name)}>
            {(id) => (
              <input
                id={id}
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder={t('e.g. Registration Confirmation')}
                aria-invalid={Boolean(errors.name) || undefined}
                className={inputClass(Boolean(errors.name))}
              />
            )}
          </FormField>

          <div>
            <h3 className="text-[15px] font-semibold text-[#1A1A1A]">{t('When should this message be sent?')}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5 mb-5">{t('When this happens → wait this long → send this message.')}</p>
            <ol>
              <RuleStep label={t('WHEN')} title={t('Trigger')} required>
                <SelectField
                  value={draft.trigger}
                  options={triggerOptions.map((o) => ({ ...o, label: t(o.label) }))}
                  onChange={(trigger) =>
                    // "Before Event" always needs a lead time; start from 1 day.
                    update(triggerDef(trigger).timing === 'before' && !draft.timing.value ? { trigger, timing: { ...draft.timing, value: '1', unit: 'days' } } : { trigger })
                  }
                  placeholder={t('Select trigger')}
                  icon="solar:bolt-linear"
                  invalid={Boolean(errors.trigger)}
                />
                {def && <p className="mt-2 text-xs text-[#6B7280]">{t(def.description)}</p>}
                {errors.trigger && <p className="mt-2 text-xs text-[#DC2626]">{t(errors.trigger)}</p>}
              </RuleStep>
              <RuleStep label={t('WAIT')} title={def?.timing === 'datetime' ? t('Send on') : t('Send')}>
                <TimingSelector trigger={def} timing={draft.timing} onChange={(p) => update({ timing: { ...draft.timing, ...p } })} error={errors.timing} />
              </RuleStep>
              <RuleStep label={t('THEN')} title={t('Send via')} required last>
                <div role="radiogroup" aria-label={t('Channel')} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHANNELS.map((c) => {
                    const checked = draft.channel === c.id;
                    return (
                      <label
                        key={c.id}
                        className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#FF6115]/40 ${
                          checked ? 'border-[#FF6115] bg-[#FFF5EF]' : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <input type="radio" name="automation-channel" checked={checked} onChange={() => update({ channel: c.id })} className="sr-only" />
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#FF6115] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                          <Icon icon={c.icon} width={20} height={20} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-[#1A1A1A]">{t(c.label)}</span>
                          <span className="block text-xs text-[#6B7280]">{t(c.description)}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </RuleStep>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1A1A1A]">{t('Message Content')}</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {t('What attendees receive in PEEP OA. Add up to {max} messages, sent together in this order.', { max: MAX_MESSAGES })}
              </p>
            </div>
            <ol className="space-y-4">
              {draft.messages.map((m, i) => (
                <li key={m.key} className="rounded-xl border border-[#E5E7EB] p-4 sm:p-5 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                      <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#E5540F] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      {t('Message {number}', { number: i + 1 })}
                    </p>
                    {draft.messages.length > 1 && (
                      <div className="flex items-center -mr-1.5">
                        <IconButton icon="solar:arrow-up-linear" label={t('Move message {number} up', { number: i + 1 })} disabled={i === 0} onClick={() => moveMessage(i, i - 1)} />
                        <IconButton
                          icon="solar:arrow-down-linear"
                          label={t('Move message {number} down', { number: i + 1 })}
                          disabled={i === draft.messages.length - 1}
                          onClick={() => moveMessage(i, i + 1)}
                        />
                        <IconButton icon="solar:trash-bin-trash-linear" label={t('Remove message {number}', { number: i + 1 })} destructive onClick={() => removeMessage(i)} />
                      </div>
                    )}
                  </div>
                  <MessageTypePicker name={`automation-message-type-${m.key}`} value={m.type} onChange={(type) => setMessage(i, { type })} />
                  <MessageEditor content={m} onChange={(p) => setMessage(i, p)} errors={messageErrors(errors, i)} />
                </li>
              ))}
            </ol>
            {draft.messages.length < MAX_MESSAGES ? (
              <button
                type="button"
                onClick={addMessage}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#FFB38A] text-sm font-medium text-[#E5540F] hover:bg-[#FFF5EF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
              >
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                {t('Add message')}
                <span className="text-xs font-normal text-[#9CA3AF]">
                  ({draft.messages.length}/{MAX_MESSAGES})
                </span>
              </button>
            ) : (
              <p className="text-xs text-[#6B7280] text-center">{t('You’ve reached the maximum of {max} messages.', { max: MAX_MESSAGES })}</p>
            )}
          </div>
        </div>

        {/* Preview: beside the editor on desktop, below it on smaller screens. */}
        <aside className="border-t lg:border-t-0 lg:border-l border-[#E5E7EB] bg-[#F9FAFB] px-4 sm:px-6 py-6">
          <div className="lg:sticky lg:top-6">
            <p className="text-sm font-semibold text-[#1A1A1A]">{t('Preview')}</p>
            <p className="text-xs text-[#6B7280] mt-0.5 mb-4">{t('Variables show sample values.')}</p>
            <MessagePreview messages={draft.messages} values={previewValues} caption={caption} accountId={accountId} />
          </div>
        </aside>
      </div>
    </Drawer>
  );
}

function RuleStep({ label, title, required, last, children }: { label: string; title: string; required?: boolean; last?: boolean; children: React.ReactNode }) {
  const t = useT();
  return (
    <li className={`relative pl-[60px] ${last ? '' : 'pb-6'}`}>
      {!last && <span aria-hidden="true" className="absolute left-[21px] top-11 bottom-1 w-0.5 rounded-full bg-[#FFD9C4]" />}
      <span className="absolute left-0 top-0 w-11 h-11 rounded-full bg-[#FFF0E8] border border-[#FFD9C4] text-[10px] font-bold tracking-wider text-[#E5540F] flex items-center justify-center">
        {label}
      </span>
      <p className="pt-0.5 mb-2 text-sm font-medium text-[#1A1A1A]">
        {title}
        {required && (
          <>
            <span className="text-[#DC2626] ml-0.5" aria-hidden="true">*</span>
            <span className="sr-only"> {t('(required)')}</span>
          </>
        )}
      </p>
      {children}
    </li>
  );
}

function MessageTypePicker({ name, value, onChange }: { name: string; value: PreviewContent['type']; onChange: (type: PreviewContent['type']) => void }) {
  const t = useT();
  return (
    <FormField label={t('Message Type')} required asGroup>
      {() => (
        <div role="radiogroup" aria-label={t('Message Type')} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {MESSAGE_TYPES.map((m) => {
            const checked = value === m.id;
            return (
              <label
                key={m.id}
                title={m.available ? undefined : t('Coming soon')}
                className={`relative flex flex-col items-center justify-center gap-1.5 h-[76px] px-1 rounded-xl border text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#FF6115]/40 ${
                  !m.available
                    ? 'border-[#F0F0F0] bg-[#F9FAFB] text-[#C4C8CF] cursor-not-allowed'
                    : checked
                      ? 'border-[#FF6115] bg-[#FFF5EF] text-[#E5540F] cursor-pointer'
                      : 'border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer'
                }`}
              >
                <input type="radio" name={name} checked={checked} disabled={!m.available} onChange={() => onChange(m.id)} className="sr-only" />
                <Icon icon={m.icon} width={20} height={20} />
                <span className="text-xs font-medium leading-tight">{t(m.label)}</span>
                {!m.available && <span className="text-[10px] leading-none">{t('Coming soon')}</span>}
              </label>
            );
          })}
        </div>
      )}
    </FormField>
  );
}

function IconButton({ icon, label, disabled, destructive, onClick }: { icon: string; label: string; disabled?: boolean; destructive?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition-colors disabled:text-[#D1D5DB] disabled:hover:bg-transparent disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        destructive ? 'text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2]' : 'text-[#6B7280] hover:bg-[#F3F4F6]'
      }`}
    >
      <Icon icon={icon} width={16} height={16} />
    </button>
  );
}
