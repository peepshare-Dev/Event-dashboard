import SegmentedControl from '../form/SegmentedControl';
import SelectField from '../form/SelectField';
import { DateTimeInput } from '../form/DateTimeRange';
import { DELAY_UNITS, type DelayUnit, type TriggerDefinition } from '../../../data/automations';

export interface TimingValue {
  mode: 'immediate' | 'delay';
  value: string;
  unit: DelayUnit;
  date: string;
  time: string;
}

interface TimingSelectorProps {
  trigger: TriggerDefinition | undefined;
  timing: TimingValue;
  onChange: (patch: Partial<TimingValue>) => void;
  error?: string;
}

// The WAIT step. Adapts to the trigger: delay after it, lead time before the event, or a fixed date & time.
export default function TimingSelector({ trigger, timing, onChange, error }: TimingSelectorProps) {
  if (!trigger) return <p className="text-sm text-[#9CA3AF]">Choose a trigger first.</p>;

  if (trigger.timing === 'datetime') {
    return (
      <div>
        <DateTimeInput value={{ date: timing.date, time: timing.time }} onChange={(p) => onChange(p)} datePlaceholder="Send date" timePlaceholder="Time" invalid={Boolean(error)} className="sm:max-w-sm" />
        <ErrorText error={error} />
      </div>
    );
  }

  const amount = <DelayInput timing={timing} onChange={onChange} invalid={Boolean(error)} suffix={trigger.relation} />;

  if (trigger.timing === 'before') {
    return (
      <div>
        {amount}
        <ErrorText error={error} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SegmentedControl
        label="Send"
        value={timing.mode}
        options={[
          { value: 'immediate', label: 'Immediately' },
          { value: 'delay', label: 'After a delay' },
        ]}
        onChange={(mode) => onChange(mode === 'delay' && !timing.value ? { mode, value: '1' } : { mode })}
      />
      {timing.mode === 'delay' && amount}
      <ErrorText error={error} />
    </div>
  );
}

function DelayInput({ timing, onChange, invalid, suffix }: { timing: TimingValue; onChange: (patch: Partial<TimingValue>) => void; invalid: boolean; suffix: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <input
        inputMode="numeric"
        value={timing.value}
        onChange={(e) => onChange({ value: e.target.value.replace(/[^\d]/g, '').slice(0, 3) })}
        aria-label="Delay amount"
        aria-invalid={invalid || undefined}
        className={`w-20 h-12 px-3 text-sm text-center text-[#1A1A1A] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] ${
          invalid ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
        }`}
      />
      <div className="w-36">
        <SelectField value={timing.unit} options={DELAY_UNITS} onChange={(unit) => onChange({ unit })} placeholder="Unit" />
      </div>
      <span className="text-sm text-[#6B7280]">{suffix}</span>
    </div>
  );
}

function ErrorText({ error }: { error?: string }) {
  return error ? <p className="mt-2 text-xs text-[#DC2626]">{error}</p> : null;
}
