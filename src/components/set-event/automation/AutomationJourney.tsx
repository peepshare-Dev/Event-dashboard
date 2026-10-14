import { Icon } from '@iconify/react';
import type { Automation, TriggerType } from '../../../data/automations';
import { useT } from '@/i18n';

// The attendee's path through the event, with where each automation fires along it.
const STAGES: { label: string; icon: string; trigger?: TriggerType }[] = [
  { label: 'Registers', icon: 'solar:user-plus-linear', trigger: 'after_registration' },
  { label: 'Gets QR code', icon: 'solar:qr-code-linear' },
  { label: 'Event day nears', icon: 'solar:alarm-linear', trigger: 'before_event' },
  { label: 'Checks in', icon: 'solar:scanner-linear', trigger: 'after_checkin' },
  { label: 'Event ends', icon: 'solar:flag-linear', trigger: 'after_event' },
];

export default function AutomationJourney({ automations }: { automations: Automation[] }) {
  const t = useT();
  const count = (type: TriggerType) => automations.filter((a) => a.enabled && a.trigger.type === type).length;
  const scheduled = count('specific_datetime');

  return (
    <div className="rounded-xl border border-[#F0F0F0] bg-[#FAFAFB] px-4 py-4">
      <p className="text-xs font-semibold text-[#6B7280]">{t('Attendee journey')}</p>
      <div className="mt-3 overflow-x-auto -mx-4 px-4">
        <ol className="flex min-w-[560px]">
          {STAGES.map((stage, i) => {
            const n = stage.trigger ? count(stage.trigger) : 0;
            return (
              <li key={stage.label} className="relative flex-1 flex flex-col items-center text-center">
                {i > 0 && <span aria-hidden="true" className="absolute right-1/2 top-[18px] w-full h-0.5 bg-[#E5E7EB]" />}
                <span
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center ${
                    n > 0 ? 'bg-[#FF6115] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  <Icon icon={stage.icon} width={18} height={18} />
                </span>
                <span className="mt-2 text-xs font-medium text-[#374151]">{t(stage.label)}</span>
                {stage.trigger ? (
                  <span className={`mt-1 text-[11px] ${n > 0 ? 'text-[#E5540F] font-medium' : 'text-[#9CA3AF]'}`}>
                    {n > 0 ? t(n === 1 ? '{count} message' : '{count} messages', { count: n }) : t('No message')}
                  </span>
                ) : (
                  <span className="mt-1 text-[11px] text-[#9CA3AF]">{t('Sent by PEEP SHARE')}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      {scheduled > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Icon icon="solar:calendar-mark-linear" width={14} height={14} />
          {t(scheduled === 1 ? 'Plus {count} message at a specific date & time' : 'Plus {count} messages at a specific date & time', { count: scheduled })}
        </p>
      )}
    </div>
  );
}
