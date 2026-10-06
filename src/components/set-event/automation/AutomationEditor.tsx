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
  MESSAGE_TYPES,
  TRIGGERS,
  describeSchedule,
  newAutomationId,
  triggerDef,
  type Automation,
  type ChannelId,
  type TriggerType,
} from '../../../data/automations';

interface Draft {
  name: string;
  enabled: boolean;
  trigger: TriggerType | '';
  timing: TimingValue;
  channel: ChannelId;
  content: PreviewContent;
}

const EMPTY_RICH: PreviewContent['rich'] = { title: '', description: '', image: null, button: { label: '', action: 'open_event', url: '' } };

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
    // Every type keeps its own draft, so switching type doesn't lose what was written.
    content: {
      type: a?.content.type ?? 'text',
      text: a?.content.text ?? '',
      image: a?.content.image ?? null,
      rich: a?.content.rich ?? EMPTY_RICH,
    },
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
  const { type, text, image, rich } = draft.content;
  return {
    id,
    name: draft.name.trim(),
    enabled: draft.enabled,
    trigger: toTrigger(draft),
    channel: draft.channel,
    content: type === 'image' ? { type, image } : type === 'rich' ? { type, rich } : { type, text },
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
  const { type, text, image, rich } = draft.content;
  if (type === 'text' && !text.trim()) errors.text = 'Write the message.';
  if (type === 'image' && !image) errors.image = 'Upload an image.';
  if (type === 'rich') {
    if (!rich.title.trim()) errors.richTitle = 'Enter a title.';
    if (rich.button.label.trim() && rich.button.action === 'open_url' && !/^https?:\/\/\S+$/.test(rich.button.url.trim())) errors.buttonUrl = 'Enter a valid link, starting with https://';
  }
  return errors;
}

const triggerOptions = TRIGGERS.map((t) => ({ value: t.type, label: t.label, icon: t.icon }));

interface AutomationEditorProps {
  /** Omit to add a new automation. */
  automation?: Automation;
  /** Mock values for `{{variables}}` in the preview. */
  previewValues: Record<string, string>;
  onSave: (automation: Automation) => void;
  onClose: () => void;
}

// Add / edit one automation: WHEN (trigger) → WAIT (timing) → THEN (channel + message), with a live preview.
export default function AutomationEditor({ automation, previewValues, onSave, onClose }: AutomationEditorProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(automation));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (submitted) setErrors(validateDraft(next));
  };

  const def = draft.trigger ? triggerDef(draft.trigger) : undefined;
  const caption = def && !validateDraft(draft).timing ? describeSchedule(toTrigger(draft)) : undefined;

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
      title={automation ? 'Edit Broadcast Automation' : 'Add Broadcast Automation'}
      description="Set when and what message should be sent to attendees."
      onClose={onClose}
      maxWidth="sm:max-w-[1040px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="h-11 sm:h-10">
            Cancel
          </Button>
          <Button onClick={save} className="h-11 sm:h-10 sm:px-5">
            Save Automation
          </Button>
        </>
      }
    >
      <div data-automation-editor className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="px-4 sm:px-6 py-6 space-y-8 min-w-0">
          <FormField label="Automation Name" required hint="Only admins see this name. Attendees never do." error={errors.name}>
            {(id) => (
              <input
                id={id}
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="e.g. Registration Confirmation"
                aria-invalid={Boolean(errors.name) || undefined}
                className={inputClass(Boolean(errors.name))}
              />
            )}
          </FormField>

          <div>
            <h3 className="text-[15px] font-semibold text-[#1A1A1A]">When should this message be sent?</h3>
            <p className="text-xs text-[#6B7280] mt-0.5 mb-5">When this happens → wait this long → send this message.</p>
            <ol>
              <RuleStep label="WHEN" title="Trigger" required>
                <SelectField
                  value={draft.trigger}
                  options={triggerOptions}
                  onChange={(trigger) =>
                    // "Before Event" always needs a lead time; start from 1 day.
                    update(triggerDef(trigger).timing === 'before' && !draft.timing.value ? { trigger, timing: { ...draft.timing, value: '1', unit: 'days' } } : { trigger })
                  }
                  placeholder="Select trigger"
                  icon="solar:bolt-linear"
                  invalid={Boolean(errors.trigger)}
                />
                {def && <p className="mt-2 text-xs text-[#6B7280]">{def.description}</p>}
                {errors.trigger && <p className="mt-2 text-xs text-[#DC2626]">{errors.trigger}</p>}
              </RuleStep>
              <RuleStep label="WAIT" title={def?.timing === 'datetime' ? 'Send on' : 'Send'}>
                <TimingSelector trigger={def} timing={draft.timing} onChange={(p) => update({ timing: { ...draft.timing, ...p } })} error={errors.timing} />
              </RuleStep>
              <RuleStep label="THEN" title="Send via" required last>
                <div role="radiogroup" aria-label="Channel" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          <span className="block text-sm font-semibold text-[#1A1A1A]">{c.label}</span>
                          <span className="block text-xs text-[#6B7280]">{c.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </RuleStep>
            </ol>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Message Content</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">What attendees receive in PEEP OA.</p>
            </div>
            <FormField label="Message Type" required asGroup>
              {() => (
                <div role="radiogroup" aria-label="Message Type" className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MESSAGE_TYPES.map((m) => {
                    const checked = draft.content.type === m.id;
                    return (
                      <label
                        key={m.id}
                        title={m.available ? undefined : 'Coming soon'}
                        className={`relative flex flex-col items-center justify-center gap-1.5 h-[76px] px-1 rounded-xl border text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#FF6115]/40 ${
                          !m.available
                            ? 'border-[#F0F0F0] bg-[#F9FAFB] text-[#C4C8CF] cursor-not-allowed'
                            : checked
                              ? 'border-[#FF6115] bg-[#FFF5EF] text-[#E5540F] cursor-pointer'
                              : 'border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer'
                        }`}
                      >
                        <input
                          type="radio"
                          name="automation-message-type"
                          checked={checked}
                          disabled={!m.available}
                          onChange={() => update({ content: { ...draft.content, type: m.id } })}
                          className="sr-only"
                        />
                        <Icon icon={m.icon} width={20} height={20} />
                        <span className="text-xs font-medium leading-tight">{m.label}</span>
                        {!m.available && <span className="text-[10px] leading-none">Coming soon</span>}
                      </label>
                    );
                  })}
                </div>
              )}
            </FormField>
            <MessageEditor content={draft.content} onChange={(p) => update({ content: { ...draft.content, ...p } })} errors={errors} />
          </div>
        </div>

        {/* Preview: beside the editor on desktop, below it on smaller screens. */}
        <aside className="border-t lg:border-t-0 lg:border-l border-[#E5E7EB] bg-[#F9FAFB] px-4 sm:px-6 py-6">
          <div className="lg:sticky lg:top-6">
            <p className="text-sm font-semibold text-[#1A1A1A]">Preview</p>
            <p className="text-xs text-[#6B7280] mt-0.5 mb-4">Variables show sample values.</p>
            <MessagePreview content={draft.content} values={previewValues} caption={caption} />
          </div>
        </aside>
      </div>
    </Drawer>
  );
}

function RuleStep({ label, title, required, last, children }: { label: string; title: string; required?: boolean; last?: boolean; children: React.ReactNode }) {
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
            <span className="sr-only"> (required)</span>
          </>
        )}
      </p>
      {children}
    </li>
  );
}
