import { useId } from 'react';
import { Icon } from '@iconify/react';

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
}

interface ChoiceCardsProps<T extends string> {
  /** Accessible name for the group (usually the field label). */
  label: string;
  value: T | '';
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
  invalid?: boolean;
  /** Grid classes for the cards, e.g. `sm:grid-cols-3`. */
  columns?: string;
}

// Radio group drawn as selectable cards — for choices that change what the rest of the form asks.
export default function ChoiceCards<T extends string>({ label, value, options, onChange, invalid, columns = 'sm:grid-cols-2' }: ChoiceCardsProps<T>) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} aria-invalid={invalid || undefined} className={`grid grid-cols-1 ${columns} gap-3`}>
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <label
            key={o.value}
            className={`relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#FF6115]/40 ${
              checked
                ? 'border-[#FF6115] bg-[#FFF5EF]'
                : invalid
                  ? 'border-[#DC2626] bg-white hover:bg-[#F9FAFB]'
                  : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
            }`}
          >
            <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
            {o.icon && (
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  checked ? 'bg-[#FF6115] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
              >
                <Icon icon={o.icon} width={20} height={20} />
              </span>
            )}
            <span className="flex-1 min-w-0">
              <span className={`block text-sm font-semibold ${checked ? 'text-[#E5540F]' : 'text-[#1A1A1A]'}`}>{o.label}</span>
              {o.description && <span className="block mt-0.5 text-xs text-[#6B7280] leading-relaxed">{o.description}</span>}
            </span>
            <span
              aria-hidden="true"
              className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                checked ? 'border-[#FF6115]' : 'border-[#D1D5DB]'
              }`}
            >
              {checked && <span className="w-2 h-2 rounded-full bg-[#FF6115]" />}
            </span>
          </label>
        );
      })}
    </div>
  );
}
