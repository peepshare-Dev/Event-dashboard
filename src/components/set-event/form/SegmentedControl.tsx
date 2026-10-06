import { useId } from 'react';

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

// Compact two/three-way switch (Yes / No, Unlimited / Limited…), built on native radios.
export default function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex p-1 gap-1 rounded-[10px] bg-[#F3F4F6] max-w-full">
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <label
            key={o.value}
            className={`relative min-w-20 h-9 px-4 flex items-center justify-center rounded-lg text-sm cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#FF6115]/40 ${
              checked ? 'bg-white text-[#1A1A1A] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.08)]' : 'text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
