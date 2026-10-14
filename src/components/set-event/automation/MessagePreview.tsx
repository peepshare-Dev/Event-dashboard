import { Icon } from '@iconify/react';
import { fillVariables, type ClaimMessage, type MessageImage, type MessageType } from '../../../data/automations';
import { useT } from '@/i18n';

export interface PreviewContent {
  type: MessageType;
  text: string;
  image: MessageImage | null;
  claim: ClaimMessage;
}

interface MessagePreviewProps {
  /** Shown as consecutive bubbles, in order. */
  messages: PreviewContent[];
  /** Variable values to show in place of `{{key}}`. */
  values: Record<string, string>;
  /** e.g. "Sent immediately after check-in" */
  caption?: string;
  /** Sender's PEEP OA ID; falls back to "Official Account". */
  accountId?: string;
}

// How the message looks to the attendee in the PEEP OA chat.
export default function MessagePreview({ messages, values, caption, accountId }: MessagePreviewProps) {
  const t = useT();
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.08)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#F0F0F0]">
        <span className="w-8 h-8 rounded-full bg-[#FF6115] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">PS</span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-sm font-semibold text-[#1A1A1A]">
            PEEP OA
            <Icon icon="solar:verified-check-bold" width={14} height={14} className="text-[#22C55E]" aria-label={t('Official account')} />
          </p>
          <p className="text-[11px] text-[#9CA3AF] truncate">{accountId || t('Official Account')}</p>
        </div>
      </div>

      <div className="min-h-[300px] bg-[#EEF1F5] px-3 py-4 space-y-3">
        {caption && (
          <p className="mx-auto w-fit max-w-full px-2.5 py-1 rounded-full bg-black/5 text-[11px] text-[#6B7280] text-center">{caption}</p>
        )}
        <div className="space-y-1.5">
          {messages.map((content, i) => (
            <div key={i} className="flex items-start gap-2">
              {/* Avatar on the first bubble only, like a chat thread. */}
              {i === 0 ? (
                <span className="w-7 h-7 rounded-full bg-[#FF6115] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">PS</span>
              ) : (
                <span className="w-7 flex-shrink-0" aria-hidden="true" />
              )}
              <Bubble content={content} values={values} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bubble({ content, values }: { content: PreviewContent; values: Record<string, string> }) {
  const t = useT();
  if (content.type === 'image') {
    return content.image ? (
      <img src={content.image.url} alt="" className="max-w-[210px] rounded-2xl rounded-tl-md object-cover" />
    ) : (
      <Placeholder icon="solar:gallery-wide-linear" text={t('Your image will appear here.')} />
    );
  }

  if (content.type === 'claim') {
    const { image, url, claimedImage, claimedText } = content.claim;
    if (!image && !claimedImage && !claimedText.trim()) return <Placeholder icon="solar:gift-linear" text={t('Your claim gift message will appear here.')} />;
    return (
      <div className="space-y-2">
        {image ? (
          <div className="relative w-[210px]">
            <img src={image.url} alt="" className="w-full aspect-square rounded-2xl rounded-tl-md object-cover" />
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-black/60 text-white text-[10px] font-medium">
              <Icon icon="solar:gift-linear" width={12} height={12} />
              {t('Tap to claim')}
            </span>
          </div>
        ) : (
          <Placeholder icon="solar:gift-linear" text={t('Giveaway image')} />
        )}
        {url.trim() && <p className="max-w-[210px] text-[10px] text-[#9CA3AF] truncate">{t('Opens {url}', { url: url.trim() })}</p>}
        <p className="w-[210px] flex items-center gap-2 text-[10px] text-[#9CA3AF]">
          <span className="flex-1 h-px bg-[#D1D5DB]" />
          {t('After closing the webview')}
          <span className="flex-1 h-px bg-[#D1D5DB]" />
        </p>
        {claimedImage && <img src={claimedImage.url} alt="" className="w-[210px] aspect-square rounded-2xl object-cover" />}
        {claimedText.trim() && (
          <div className="max-w-[230px] w-fit px-3.5 py-2.5 bg-white rounded-2xl text-sm text-[#1A1A1A] whitespace-pre-wrap break-words shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
            {fillVariables(claimedText, values)}
          </div>
        )}
      </div>
    );
  }

  return content.text.trim() ? (
    <div className="max-w-[230px] px-3.5 py-2.5 bg-white rounded-2xl rounded-tl-md text-sm text-[#1A1A1A] whitespace-pre-wrap break-words shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      {fillVariables(content.text, values)}
    </div>
  ) : (
    <Placeholder icon="solar:chat-round-dots-linear" text={t('Your message will appear here.')} />
  );
}

function Placeholder({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="w-[210px] px-3.5 py-6 bg-white/70 border border-dashed border-[#D1D5DB] rounded-2xl rounded-tl-md flex flex-col items-center gap-2 text-center">
      <Icon icon={icon} width={22} height={22} className="text-[#9CA3AF]" />
      <p className="text-xs text-[#9CA3AF]">{text}</p>
    </div>
  );
}
