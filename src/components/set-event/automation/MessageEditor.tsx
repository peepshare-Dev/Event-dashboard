import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import BannerDropzone from '../BannerDropzone';
import FormField, { inputClass, textareaClass } from '../form/FormField';
import { MESSAGE_VARIABLES, type ClaimMessage } from '../../../data/automations';
import type { PreviewContent } from './MessagePreview';
import { useT } from '@/i18n';

export const TEXT_LIMIT = 1000;

interface MessageEditorProps {
  content: PreviewContent;
  onChange: (patch: Partial<PreviewContent>) => void;
  /** Keys: `text`, `image`, `claimImage`, `claimUrl`, `claimedImage`, `claimedText`. */
  errors: Record<string, string | undefined>;
}

// Editor for the selected message type (Text / Image / Claim Gift).
export default function MessageEditor({ content, onChange, errors }: MessageEditorProps) {
  const t = useT();
  if (content.type === 'image') {
    return (
      <FormField label={t('Image')} required error={errors.image && t(errors.image)} asGroup>
        {() => (
          <BannerDropzone title={t('Message image')} suggestedSize="1040 × 1040 px (1:1)" value={content.image} onChange={(image) => onChange({ image })} />
        )}
      </FormField>
    );
  }

  if (content.type === 'claim') {
    const claim = content.claim;
    const setClaim = (patch: Partial<ClaimMessage>) => onChange({ claim: { ...claim, ...patch } });
    return (
      <div className="space-y-5">
        <div className="flex gap-2.5 rounded-lg bg-[#F9FAFB] border border-[#F0F0F0] px-3.5 py-3 text-xs text-[#4B5563]">
          <Icon icon="solar:info-circle-linear" width={16} height={16} className="text-[#6B7280] flex-shrink-0 mt-px" />
          <p>
            {t('Attendees tap the giveaway image to open the link in a webview. When they close it, PEEP OA sends the claimed image and message. All fields are required.')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          <FormField label={t('Giveaway Image')} required hint={t('Sent in the broadcast.')} error={errors.claimImage && t(errors.claimImage)} asGroup>
            {() => (
              <BannerDropzone
                title={t('Giveaway image')}
                suggestedSize="1040 × 1040 px (1:1)"
                value={claim.image}
                onChange={(image) => setClaim({ image })}
                invalid={Boolean(errors.claimImage)}
              />
            )}
          </FormField>
          <FormField label={t('Claimed Image')} required hint={t('Sent after the gift is claimed.')} error={errors.claimedImage && t(errors.claimedImage)} asGroup>
            {() => (
              <BannerDropzone
                title={t('Claimed image')}
                suggestedSize="1040 × 1040 px (1:1)"
                value={claim.claimedImage}
                onChange={(claimedImage) => setClaim({ claimedImage })}
                invalid={Boolean(errors.claimedImage)}
              />
            )}
          </FormField>
        </div>
        <FormField label={t('Link URL')} required hint={t('Opens in a webview when the image is tapped.')} error={errors.claimUrl && t(errors.claimUrl)}>
          {(id) => (
            <input
              id={id}
              type="url"
              inputMode="url"
              value={claim.url}
              onChange={(e) => setClaim({ url: e.target.value })}
              placeholder="https://"
              aria-invalid={Boolean(errors.claimUrl) || undefined}
              className={inputClass(Boolean(errors.claimUrl))}
            />
          )}
        </FormField>
        <FormField label={t('Message After Claiming')} required hint={t('Sent when the attendee closes the webview.')} error={errors.claimedText && t(errors.claimedText)} asGroup>
          {() => (
            <TextWithVariables
              value={claim.claimedText}
              onChange={(claimedText) => setClaim({ claimedText })}
              rows={3}
              placeholder={t('e.g. You’ve claimed your gift from {{event_name}}!')}
              maxLength={TEXT_LIMIT}
              invalid={Boolean(errors.claimedText)}
            />
          )}
        </FormField>
      </div>
    );
  }

  return (
    <FormField label={t('Message')} required error={errors.text && t(errors.text)} asGroup>
      {() => (
        <TextWithVariables
          value={content.text}
          onChange={(text) => onChange({ text })}
          rows={6}
          placeholder={t('Write your message...')}
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
  const t = useT();
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
        {t('Insert variable')}
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
                <span className="text-sm text-[#374151]">{t(v.label)}</span>
                <code className="text-[11px] text-[#9CA3AF]">{`{{${v.key}}}`}</code>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
