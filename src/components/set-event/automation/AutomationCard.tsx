import { Icon } from '@iconify/react';
import Toggle from '../../ui/Toggle';
import {
  MESSAGE_VARIABLES,
  channelLabel,
  describeTiming,
  messageTypeLabel,
  splitVariables,
  triggerDef,
  type Automation,
} from '../../../data/automations';

interface AutomationCardProps {
  automation: Automation;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}

// One rule, read left to right: WHEN → WAIT → THEN, then the message it sends.
export default function AutomationCard({ automation, onEdit, onDuplicate, onDelete, onToggle }: AutomationCardProps) {
  const { name, enabled, trigger, channel, content } = automation;
  const def = triggerDef(trigger.type);

  return (
    <article className={`rounded-xl border p-4 sm:p-5 transition-colors ${enabled ? 'border-[#E5E7EB] bg-white' : 'border-[#E5E7EB] bg-[#F9FAFB]'}`}>
      <div className="flex items-start justify-between gap-3">
        <h4 className={`text-[15px] font-semibold truncate ${enabled ? 'text-[#1A1A1A]' : 'text-[#6B7280]'}`}>{name}</h4>
        <span
          className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium flex-shrink-0 ${
            enabled ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#F3F4F6] text-[#6B7280]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-[#22C55E]' : 'border border-[#9CA3AF]'}`} aria-hidden="true" />
          {enabled ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className={`mt-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2 ${enabled ? '' : 'opacity-60'}`}>
        <RulePart label="Trigger" step="WHEN" icon={def.icon} value={def.label} />
        <Arrow />
        <RulePart label="Timing" step="WAIT" icon="solar:clock-circle-linear" value={describeTiming(trigger)} />
        <Arrow />
        <RulePart label="Channel" step="THEN" icon="solar:chat-round-dots-linear" value={`${channelLabel(channel)} · ${messageTypeLabel(content.type)}`} />
      </div>

      <div className={`mt-3 rounded-lg bg-[#F9FAFB] border border-[#F0F0F0] px-3.5 py-3 text-sm text-[#374151] ${enabled ? '' : 'opacity-60'}`}>
        <ContentSummary content={content} />
      </div>

      <div className="mt-3 pt-3 border-t border-[#F0F0F0] flex items-center justify-between gap-3">
        <div className="flex items-center -ml-2">
          <CardAction icon="solar:pen-new-square-linear" label="Edit" onClick={onEdit} />
          <CardAction icon="solar:copy-linear" label="Duplicate" onClick={onDuplicate} />
          <CardAction icon="solar:trash-bin-trash-linear" label="Delete" onClick={onDelete} destructive />
        </div>
        <Toggle checked={enabled} onChange={onToggle} label={enabled ? 'On' : 'Off'} />
      </div>
    </article>
  );
}

function RulePart({ step, label, icon, value }: { step: string; label: string; icon: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0 rounded-lg border border-[#F0F0F0] px-3 py-2">
      <Icon icon={icon} width={18} height={18} className="text-[#FF6115] flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-wider text-[#9CA3AF]">
          {step} <span className="font-medium tracking-normal">· {label}</span>
        </p>
        <p className="text-sm font-medium text-[#1A1A1A] truncate">{value}</p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <span className="flex items-center justify-center text-[#D1D5DB]" aria-hidden="true">
      <Icon icon="solar:arrow-right-linear" width={16} height={16} className="hidden sm:block" />
      <Icon icon="solar:arrow-down-linear" width={14} height={14} className="sm:hidden" />
    </span>
  );
}

/** Readable message preview: variables appear as labelled chips instead of `{{raw_keys}}`. */
function ContentSummary({ content }: { content: Automation['content'] }) {
  if (content.type === 'image') {
    return content.image ? (
      <div className="flex items-center gap-3">
        <img src={content.image.url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        <span className="truncate">{content.image.name}</span>
      </div>
    ) : (
      <span className="text-[#9CA3AF]">No image</span>
    );
  }
  if (content.type === 'rich' && content.rich) {
    const { title, description, button } = content.rich;
    return (
      <div className="space-y-1">
        <p className="font-semibold text-[#1A1A1A]"><WithVariables text={title} /></p>
        {description && <p className="line-clamp-2"><WithVariables text={description} /></p>}
        {button.label && (
          <span className="inline-flex items-center h-7 mt-1 px-3 rounded-full border border-[#FFD9C4] bg-white text-xs font-medium text-[#E5540F]">{button.label}</span>
        )}
      </div>
    );
  }
  return (
    <p className="whitespace-pre-line line-clamp-3">
      <WithVariables text={content.text ?? ''} />
    </p>
  );
}

function WithVariables({ text }: { text: string }) {
  return (
    <>
      {splitVariables(text).map((part, i) =>
        'variable' in part ? (
          <span key={i} className="inline-block px-1 rounded bg-[#FFF0E8] text-[#E5540F] text-[0.92em] font-medium">
            {MESSAGE_VARIABLES.find((v) => v.key === part.variable)?.label ?? part.variable}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

function CardAction({ icon, label, destructive, onClick }: { icon: string; label: string; destructive?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        destructive ? 'text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2]' : 'text-[#374151] hover:bg-[#F3F4F6]'
      }`}
    >
      <Icon icon={icon} width={16} height={16} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </button>
  );
}
