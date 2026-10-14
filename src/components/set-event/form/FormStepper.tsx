import { Icon } from '@iconify/react';
import { useT } from '@/i18n';

/** error = needs fixing; todo = required info missing; done = filled in; undefined = optional and not set. */
export type FillStatus = 'error' | 'todo' | 'done' | undefined;

export interface FormStep {
  label: string;
  /** Sections inside this step, with how far each is filled in. */
  sections: { label: string; status: FillStatus }[];
}

interface FormStepperProps {
  steps: FormStep[];
  current: number;
  /** Furthest step that can be opened (Edit Event: the last one). */
  reached: number;
  onStepClick: (index: number) => void;
  /** List each step's sections with their fill status (Edit Event). Off = plain numbered steps (Create Event). */
  showSections?: boolean;
}

const STATUS_LABEL: Record<NonNullable<FillStatus> | 'unset', string> = {
  done: 'Filled in',
  todo: 'Missing required info',
  error: 'Needs attention',
  unset: 'Not set (optional)',
};

export function StatusDot({ status }: { status: FillStatus }) {
  const t = useT();
  const label = t(STATUS_LABEL[status ?? 'unset']);
  if (status === 'done') return <Icon icon="solar:check-circle-bold" width={16} height={16} className="flex-shrink-0 text-[#22C55E]" aria-label={label} />;
  if (status === 'error') return <Icon icon="solar:danger-circle-bold" width={16} height={16} className="flex-shrink-0 text-[#DC2626]" aria-label={label} />;
  if (status === 'todo') return <span role="img" aria-label={label} className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-[#F59E0B]" />;
  return <span role="img" aria-label={label} className="w-4 h-4 flex-shrink-0 rounded-full border border-dashed border-[#C4C8CF]" />;
}

const stepState = (step: FormStep) =>
  step.sections.some((s) => s.status === 'error') ? 'error' : step.sections.some((s) => s.status === 'todo') ? 'todo' : 'done';

// Step indicator for the Create / Edit Event form. In Edit Event each step also lists its sections and whether they're filled in.
export default function FormStepper({ steps, current, reached, onStepClick, showSections = false }: FormStepperProps) {
  const t = useT();
  return (
    <nav aria-label={t('Event form steps')}>
      {/* Phones: progress bar (+ the current step's sections). */}
      <div className="sm:hidden bg-white border border-[#E5E7EB] rounded-2xl p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-[#1A1A1A]">{steps[current].label}</p>
          <p className="text-xs text-[#6B7280] flex-shrink-0">
            {t('Step {n} of {total}', { n: current + 1, total: steps.length })}
          </p>
        </div>
        <div className="mt-2 flex gap-1.5">
          {steps.map((step, i) => {
            const state = stepState(step);
            return (
              <button
                key={step.label}
                type="button"
                onClick={() => onStepClick(i)}
                disabled={i > reached}
                aria-label={t('Step {n}: {label}', { n: i + 1, label: step.label })}
                aria-current={i === current ? 'step' : undefined}
                className={`flex-1 h-1.5 rounded-full disabled:cursor-not-allowed ${
                  state === 'error' ? 'bg-[#DC2626]' : i === current ? 'bg-[#FF6115]' : state === 'done' && i <= reached ? 'bg-[#22C55E]' : 'bg-[#E5E7EB]'
                }`}
              />
            );
          })}
        </div>
        {showSections && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {steps[current].sections.map((s) => (
              <li key={s.label} className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                <StatusDot status={s.status} />
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tablet / desktop */}
      <div
        className={`hidden sm:block bg-white border border-[#E5E7EB] rounded-2xl px-4 lg:px-6 pt-4 ${showSections ? 'pb-3' : 'pb-4'} shadow-[0_1px_2px_rgba(16,24,40,0.04)]`}
      >
        <ol className="flex items-start">
          {steps.map((step, i) => {
            const isCurrent = i === current;
            const state = stepState(step);
            const open = i <= reached;
            return (
              <li key={step.label} className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => onStepClick(i)}
                  disabled={!open}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`group w-full text-left rounded-xl p-2 -m-2 sm:pr-3 transition-colors disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
                    isCurrent ? '' : open ? 'hover:bg-[#F9FAFB]' : ''
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-[#FF6115] text-white'
                          : state === 'error'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                            : state === 'done' && open
                              ? 'bg-[#F0FDF4] text-[#16A34A]'
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {!isCurrent && state === 'done' && open ? <Icon icon="solar:check-read-linear" width={18} height={18} aria-label={t('Complete')} /> : i + 1}
                    </span>
                    <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#E5540F]' : open ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}>{step.label}</span>
                  </span>
                  {showSections && (
                    <span className="mt-2.5 pl-11 block space-y-1.5">
                      {step.sections.map((s) => (
                        <span key={s.label} className="flex items-center gap-2 min-w-0 text-xs text-[#6B7280]">
                          <StatusDot status={s.status} />
                          <span className="truncate">{s.label}</span>
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        {showSections && (
          <ul className="mt-4 pt-3 border-t border-[#F0F0F0] flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#6B7280]" aria-label={t('Legend')}>
            {(['done', 'todo', 'error', undefined] as FillStatus[]).map((status) => (
              <li key={status ?? 'unset'} className="flex items-center gap-1.5">
                <StatusDot status={status} />
                {t(STATUS_LABEL[status ?? 'unset'])}
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
