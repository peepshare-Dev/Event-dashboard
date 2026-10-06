import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { inputClass } from './FormField';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface SelectFieldProps<T extends string> {
  id?: string;
  value: T | '';
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder: string;
  /** Shown in the box before the value (falls back to the option's own icon). */
  icon?: string;
  invalid?: boolean;
}

// Single-select dropdown in the same box as the text inputs (Event Type, Category, field types…).
export default function SelectField<T extends string>({ id, value, options, onChange, placeholder, icon, invalid }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const shownIcon = selected?.icon ?? icon;

  useEffect(() => {
    if (!open) return;
    // Land on the selected option so arrow keys start from there.
    const current = listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]') ?? listRef.current?.querySelector('button');
    current?.focus({ preventScroll: true });
    // Scroll only inside the list (scrollIntoView would also scroll the page).
    const list = listRef.current;
    if (current && list) list.scrollTop = current.offsetTop - list.clientHeight / 2;
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      // Only close the list, not a drawer or modal around it.
      e.stopPropagation();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[Math.min(index + 1, items.length - 1)]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[Math.max(index - 1, 0)]?.focus();
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        className={`${inputClass(invalid)} flex items-center gap-2.5 text-left`}
      >
        {shownIcon && <Icon icon={shownIcon} width={18} height={18} className={`flex-shrink-0 ${selected ? 'text-[#FF6115]' : 'text-[#9CA3AF]'}`} />}
        <span className={`flex-1 truncate ${selected ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}>{selected?.label ?? placeholder}</span>
        <Icon icon="solar:alt-arrow-down-linear" width={16} height={16} className={`flex-shrink-0 text-[#9CA3AF] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            ref={listRef}
            role="listbox"
            onKeyDown={onListKeyDown}
            className="absolute top-full left-0 right-0 mt-1 z-30 max-h-72 overflow-y-auto bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5"
          >
            {options.map((o) => {
              const isSelected = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(o.value);
                    close();
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors focus:outline-none focus-visible:bg-[#F9FAFB] ${
                    isSelected ? 'text-[#FF6115] bg-[#FFF0E8] font-medium' : 'text-[#4B5563] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {o.icon && <Icon icon={o.icon} width={16} height={16} className="flex-shrink-0" />}
                  <span className="flex-1 truncate">{o.label}</span>
                  {isSelected && <Icon icon="solar:check-linear" width={14} height={14} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
