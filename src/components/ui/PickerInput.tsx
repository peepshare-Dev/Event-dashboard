import { useRef } from 'react';
import { Icon } from '@iconify/react';

interface PickerInputProps {
  type: 'date' | 'time';
  /** `YYYY-MM-DD` for date, `HH:mm` for time, or empty */
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  min?: string;
  max?: string;
  invalid?: boolean;
  size?: 'sm' | 'md';
  icon?: string;
  className?: string;
}

/** `2026-09-28` → `28-09-2026` */
function formatDate(value: string) {
  const [y, m, d] = value.split('-');
  return `${d}-${m}-${y}`;
}

// A date/time box with a visible placeholder. The native input sits invisibly on top, so
// the browser picker and keyboard entry still work.
export default function PickerInput({
  type,
  value,
  onChange,
  placeholder,
  min,
  max,
  invalid,
  size = 'sm',
  icon: iconOverride,
  className = '',
}: PickerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const icon = iconOverride ?? (type === 'date' ? 'solar:calendar-bold' : 'solar:clock-circle-bold');
  const display = value ? (type === 'date' ? formatDate(value) : value) : placeholder;

  return (
    <label
      className={`relative flex items-center gap-2 bg-white border rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-[#FF6115]/30 focus-within:border-[#FF6115] ${
        invalid ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
      } ${size === 'md' ? 'h-12 px-3' : 'h-10 px-3'} ${className}`}
    >
      <Icon icon={icon} width={size === 'md' ? 14 : 15} height={size === 'md' ? 14 : 15} className="text-[#9CA3AF] flex-shrink-0" />
      <span className={`truncate ${size === 'md' ? 'text-sm' : 'text-xs'} ${value ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}>
        {display}
      </span>
      <input
        ref={inputRef}
        type={type}
        aria-label={placeholder}
        aria-invalid={invalid || undefined}
        value={value}
        min={min || undefined}
        max={max || undefined}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => inputRef.current?.showPicker?.()}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </label>
  );
}
