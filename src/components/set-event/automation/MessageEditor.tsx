import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import BannerDropzone from '../BannerDropzone';
import FormField, { inputClass, textareaClass } from '../form/FormField';
import SelectField from '../form/SelectField';
import { BUTTON_ACTIONS, MESSAGE_VARIABLES, type RichMessage } from '../../../data/automations';
import type { PreviewContent } from './MessagePreview';

export const TEXT_LIMIT = 1000;

interface MessageEditorProps {
  content: PreviewContent;
  onChange: (patch: Partial<PreviewContent>) => void;
  /** Keys: `text`, `image`, `richTitle`, `buttonUrl`. */
  errors: Record<string, string | undefined>;
}

// Editor for the selected message type (Text / Image / Rich Message).
export default function MessageEditor({ content, onChange, errors }: MessageEditorProps) {
  if (content.type === 'image') {
    return (
      <FormField label="Image" required error={errors.image} asGroup>
        {() => (
          <BannerDropzone title="Message image" suggestedSize="1040 × 1040 px (1:1)" value={content.image} onChange={(image) => onChange({ image })} />
        )}
      </FormField>
    );
  }

  if (content.type === 'rich') {
    const rich = content.rich;
    const setRich = (patch: Partial<RichMessage>) => onChange({ rich: { ...rich, ...patch } });
    const setButton = (patch: Partial<RichMessage['button']>) => setRich({ button: { ...rich.button, ...patch } });
    return (
      <div className="space-y-5">
        <FormField label="Title" required error={errors.richTitle}>
          {(id) => (
            <input
              id={id}
              value={rich.title}
              onChange={(e) => setRich({ title: e.target.value })}
              placeholder="e.g. 🎁 Special Offer!"
              aria-invalid={Boolean(errors.richTitle) || undefined}
              className={inputClass(Boolean(errors.richTitle))}
            />
          )}
        </FormField>
        <FormField label="Description" asGroup>
          {() => <TextWithVariables value={rich.description} onChange={(description) => setRich({ description })} rows={3} placeholder="Tell attendees what this message is about." />}
        </FormField>
        <FormField label="Image" hint="Optional. Shown at the top of the card." asGroup>
          {() => <BannerDropzone title="Card image" suggestedSize="1040 × 520 px (2:1)" aspect="wide" value={rich.image} onChange={(image) => setRich({ image })} />}
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          <FormField label="Button Label" hint="Leave empty for no button.">
            {(id) => (
              <input id={id} value={rich.button.label} onChange={(e) => setButton({ label: e.target.value })} placeholder="e.g. View Event" maxLength={20} className={inputClass()} />
            )}
          </FormField>
          <FormField label="Button Action" hint="What happens when it’s tapped.">
            {(id) => <SelectField id={id} value={rich.button.action} options={BUTTON_ACTIONS} onChange={(action) => setButton({ action })} placeholder="Select action" />}
          </FormField>
          {rich.button.action === 'open_url' && (
            <FormField label="Button URL" required={Boolean(rich.button.label)} error={errors.buttonUrl} className="sm:col-span-2">
              {(id) => (
                <input
                  id={id}
                  type="url"
                  inputMode="url"
                  value={rich.button.url}
                  onChange={(e) => setButton({ url: e.target.value })}
                  placeholder="https://"
                  aria-invalid={Boolean(errors.buttonUrl) || undefined}
                  className={inputClass(Boolean(errors.buttonUrl))}
                />
              )}
            </FormField>
          )}
        </div>
      </div>
    );
  }

  return (
    <FormField label="Message" required error={errors.text} asGroup>
      {() => (
        <TextWithVariables
          value={content.text}
          onChange={(text) => onChange({ text })}
          rows={6}
          placeholder="Write your message..."
          maxLength={TEXT_LIMIT}
          invalid={Boolean(errors.text)}
        />
      )}
    </FormField>
  );
}

/** Textarea with an "Insert variable" menu that inserts `{{key}}` at the cursor, plus a character counter. */
function TextWithVariables({ value, onChange, rows, placeholder, maxLength, invalid }: {
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder: string;
  maxLength?: number;
  invalid?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const insert = (key: string) => {
    const el = ref.current;
    const token = `{{${key}}}`;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + token + value.slice(end);
    if (maxLength && next.length > maxLength) return;
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus({ preventScroll: true });
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <div>
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        className={textareaClass(invalid)}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <VariablePicker onInsert={insert} />
        {maxLength && (
          <span className={`text-xs tabular-nums ${value.length >= maxLength ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`}>
            {value.length.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

export function VariablePicker({ onInsert }: { onInsert: (key: string) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Close just the menu, not the drawer.
      e.stopImmediatePropagation();
      setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#E5540F] bg-[#FFF0E8] hover:bg-[#FFE4D4] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
      >
        <Icon icon="solar:code-linear" width={14} height={14} />
        Insert variable
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute left-0 top-full mt-1 z-30 w-64 max-h-72 overflow-y-auto bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5">
            {MESSAGE_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  onInsert(v.key);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left hover:bg-[#F9FAFB] focus:outline-none focus-visible:bg-[#F9FAFB]"
              >
                <span className="text-sm text-[#374151]">{v.label}</span>
                <code className="text-[11px] text-[#9CA3AF]">{`{{${v.key}}}`}</code>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
