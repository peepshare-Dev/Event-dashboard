import { Icon } from '@iconify/react';
import PickerInput from './PickerInput';

interface DateRangePickerProps {
  /** `YYYY-MM-DD` or empty */
  start: string;
  /** `YYYY-MM-DD` or empty */
  end: string;
  onChange: (range: { start: string; end: string }) => void;
  className?: string;
}

export default function DateRangePicker({ start, end, onChange, className = '' }: DateRangePickerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <PickerInput
        type="date"
        icon="solar:calendar-minimalistic-linear"
        placeholder="Start Date"
        value={start}
        max={end}
        onChange={(value) => onChange({ start: value, end })}
        className="flex-1 sm:flex-none sm:w-32"
      />
      <Icon icon="solar:arrow-right-linear" width={12} height={12} className="text-[#9CA3AF] flex-shrink-0" />
      <PickerInput
        type="date"
        icon="solar:calendar-minimalistic-linear"
        placeholder="End Date"
        value={end}
        min={start}
        onChange={(value) => onChange({ start, end: value })}
        className="flex-1 sm:flex-none sm:w-32"
      />
    </div>
  );
}
