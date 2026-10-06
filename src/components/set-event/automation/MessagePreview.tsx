import { Icon } from '@iconify/react';
import { fillVariables, type MessageImage, type MessageType, type RichMessage } from '../../../data/automations';

export interface PreviewContent {
  type: MessageType;
  text: string;
  image: MessageImage | null;
  rich: RichMessage;
}

interface MessagePreviewProps {
  content: PreviewContent;
  /** Variable values to show in place of `{{key}}`. */
  values: Record<string, string>;
  /** e.g. "Sent immediately after check-in" */
  caption?: string;
}

// How the message looks to the attendee in the PEEP OA chat.
export default function MessagePreview({ content, values, caption }: MessagePreviewProps) {
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.08)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#F0F0F0]">
        <span className="w-8 h-8 rounded-full bg-[#FF6115] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">PS</span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-sm font-semibold text-[#1A1A1A]">
            PEEP OA
            <Icon icon="solar:verified-check-bold" width={14} height={14} className="text-[#22C55E]" aria-label="Official account" />
          </p>
          <p className="text-[11px] text-[#9CA3AF]">Official Account</p>
        </div>
      </div>

      <div className="min-h-[300px] bg-[#EEF1F5] px-3 py-4 space-y-3">
        {caption && (
          <p className="mx-auto w-fit max-w-full px-2.5 py-1 rounded-full bg-black/5 text-[11px] text-[#6B7280] text-center">{caption}</p>
        )}
        <div className="flex items-start gap-2">
          <span className="w-7 h-7 rounded-full bg-[#FF6115] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">PS</span>
          <Bubble content={content} values={values} />
        </div>
      </div>
    </div>
  );
}

function Bubble({ content, values }: { content: PreviewContent; values: Record<string, string> }) {
  if (content.type === 'image') {
    return content.image ? (
      <img src={content.image.url} alt="" className="max-w-[210px] rounded-2xl rounded-tl-md object-cover" />
    ) : (
      <Placeholder icon="solar:gallery-wide-linear" text="Your image will appear here." />
    );
  }

  if (content.type === 'rich') {
    const { title, description, image, button } = content.rich;
    if (!title && !description && !image && !button.label) return <Placeholder icon="solar:widget-linear" text="Your rich message will appear here." />;
    return (
      <div className="w-[230px] bg-white rounded-2xl rounded-tl-md overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        {image && <img src={image.url} alt="" className="w-full aspect-[2/1] object-cover" />}
        <div className="px-3.5 py-3">
          {title && <p className="text-sm font-semibold text-[#1A1A1A] whitespace-pre-wrap break-words">{fillVariables(title, values)}</p>}
          {description && <p className="mt-1 text-[13px] text-[#4B5563] whitespace-pre-wrap break-words">{fillVariables(description, values)}</p>}
        </div>
        {button.label && (
          <div className="border-t border-[#F0F0F0] h-10 flex items-center justify-center text-sm font-medium text-[#FF6115]">{button.label}</div>
        )}
      </div>
    );
  }

  return content.text.trim() ? (
    <div className="max-w-[230px] px-3.5 py-2.5 bg-white rounded-2xl rounded-tl-md text-sm text-[#1A1A1A] whitespace-pre-wrap break-words shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      {fillVariables(content.text, values)}
    </div>
  ) : (
    <Placeholder icon="solar:chat-round-dots-linear" text="Your message will appear here." />
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
