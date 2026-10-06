import { Icon } from '@iconify/react';
import PickerInput from '../../ui/PickerInput';

export interface DateTimeValue {
  date: string;
  time: string;
}

interface DateTimeInputProps {
  value: DateTimeValue;
  onChange: (patch: Partial<DateTimeValue>) => void;
  datePlaceholder?: string;
  timePlaceholder?: string;
  min?: string;
  max?: string;
  invalid?: boolean;
  className?: string;
}

/** A date box and a time box side by side. */
export function DateTimeInput({ value, onChange, datePlaceholder = 'DD-MM-YYYY', timePlaceholder = 'Time', min, max, invalid, className = '' }: DateTimeInputProps) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 min-w-0 ${className}`}>
      <PickerInput size="md" type="date" placeholder={datePlaceholder} value={value.date} min={min} max={max} invalid={invalid} onChange={(date) => onChange({ date })} className="flex-1 min-w-0" />
      <PickerInput size="md" type="time" placeholder={timePlaceholder} value={value.time} invalid={invalid} onChange={(time) => onChange({ time })} className="w-[7.5rem] sm:w-32 flex-shrink-0" />
    </div>
  );
}

interface DateTimeRangeProps {
  start: DateTimeValue;
  end: DateTimeValue;
  onStartChange: (patch: Partial<DateTimeValue>) => void;
  onEndChange: (patch: Partial<DateTimeValue>) => void;
  startInvalid?: boolean;
  endInvalid?: boolean;
  /** Latest allowed date for either end (e.g. registration can't run past the event). */
  max?: string;
}

// [Start date][Start time]  →  [End date][End time]; stacks with a down arrow on narrow screens.
export default function DateTimeRange({ start, end, onStartChange, onEndChange, startInvalid, endInvalid, max }: DateTimeRangeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
      <DateTimeInput value={start} onChange={onStartChange} datePlaceholder="Start date" timePlaceholder="Start time" max={end.date || max} invalid={startInvalid} />
      <Icon icon="solar:arrow-right-linear" width={18} height={18} aria-hidden="true" className="hidden md:block text-[#9CA3AF]" />
      <Icon icon="solar:arrow-down-linear" width={16} height={16} aria-hidden="true" className="md:hidden mx-auto text-[#9CA3AF]" />
      <DateTimeInput value={end} onChange={onEndChange} datePlaceholder="End date" timePlaceholder="End time" min={start.date} max={max} invalid={endInvalid} />
    </div>
  );
}
