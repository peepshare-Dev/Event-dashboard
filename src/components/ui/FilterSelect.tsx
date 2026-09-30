import { useEffect, useId, useState } from 'react';
import { Icon } from '@iconify/react';

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  className?: string;
}

// "Label: Value ▼" dropdown, following the Header dropdown pattern (click-away overlay + menu).
export default function FilterSelect<T extends string>({ label, value, options, onChange, className = '' }: FilterSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`w-full inline-flex items-center justify-between gap-1 h-8 px-2.5 text-xs text-[#FF6115] bg-[#FFF5EF] border rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
          open ? 'border-[#FF6115]' : 'border-[#FFB38F] hover:border-[#FF6115]'
        }`}
      >
        <span className="whitespace-nowrap">
          {label} : {value}
        </span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          width={11}
          height={11}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="absolute left-0 top-full mt-1 min-w-full w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 py-1.5 overflow-hidden"
          >
            {options.map((option) => {
              const selected = option === value;
              return (
                <li key={option} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                      selected ? 'text-[#FF6115] bg-[#FFF0E8] font-medium' : 'text-[#4B5563] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {option}
                    {selected && <Icon icon="solar:check-linear" width={14} height={14} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
