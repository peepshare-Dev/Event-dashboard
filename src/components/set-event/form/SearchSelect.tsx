import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../ui/Button';
import { inputClass } from './FormField';

export interface SearchSelectItem {
  id: string;
  title: string;
  meta: string[];
  thumbnail?: string;
}

interface SearchSelectProps {
  id?: string;
  value: SearchSelectItem | null;
  onChange: (item: SearchSelectItem | null) => void;
  /** Async search; called with '' to show suggestions. */
  search: (query: string) => Promise<SearchSelectItem[]>;
  placeholder: string;
  icon: string;
  invalid?: boolean;
}

// Searchable picker: type to search, pick a result, then see it as a compact card with Change / Clear.
export default function SearchSelect({ id, value, onChange, search, placeholder, icon, invalid }: SearchSelectProps) {
  const [editing, setEditing] = useState(!value);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchSelectItem[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef(search);
  searchRef.current = search;

  useEffect(() => setEditing(!value), [value]);

  // Debounced search; stale responses are ignored.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState('loading');
    const timer = setTimeout(() => {
      searchRef
        .current(query)
        .then((items) => {
          if (cancelled) return;
          setResults(items);
          setState('idle');
        })
        .catch(() => !cancelled && setState('error'));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const pick = (item: SearchSelectItem) => {
    onChange(item);
    setOpen(false);
    setQuery('');
  };

  if (value && !editing) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#FFD9C4] bg-[#FFF5EF]">
        <Thumb item={value} icon={icon} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{value.title}</p>
          <p className="text-xs text-[#6B7280] truncate">{value.meta.join(' · ')}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="secondary"
            onClick={() => {
              setEditing(true);
              setOpen(true);
              requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
            }}
            className="h-9"
          >
            Change
          </Button>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Clear ${value.title}`}
            title="Clear"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:close-circle-linear" width={20} height={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Icon icon="solar:magnifer-linear" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && open) {
              e.stopPropagation();
              setOpen(false);
            }
            if (e.key === 'Enter' && results[0] && state === 'idle') {
              e.preventDefault();
              pick(results[0]);
            }
          }}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          className={`${inputClass(invalid)} pl-10`}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2.5 text-xs text-[#6B7280] rounded-md hover:bg-[#F3F4F6]"
          >
            Keep current
          </button>
        )}
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div role="listbox" className="absolute left-0 right-0 top-full mt-1 z-30 max-h-80 overflow-y-auto bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5">
            {state === 'loading' && (
              <p className="flex items-center gap-2 px-4 py-3 text-sm text-[#6B7280]">
                <Icon icon="solar:refresh-linear" width={16} height={16} className="animate-spin" />
                Searching…
              </p>
            )}
            {state === 'error' && <p className="px-4 py-3 text-sm text-[#DC2626]">Couldn’t load results. Try again.</p>}
            {state === 'idle' && results.length === 0 && <p className="px-4 py-3 text-sm text-[#9CA3AF]">No results{query ? ` for “${query}”` : ''}.</p>}
            {state === 'idle' &&
              results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === value?.id}
                  onClick={() => pick(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#F9FAFB] focus:outline-none focus-visible:bg-[#F9FAFB]"
                >
                  <Thumb item={item} icon={icon} small />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#1A1A1A] truncate">{item.title}</span>
                    <span className="block text-xs text-[#6B7280] truncate">{item.meta.join(' · ')}</span>
                  </span>
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

function Thumb({ item, icon, small }: { item: SearchSelectItem; icon: string; small?: boolean }) {
  const size = small ? 'w-9 h-9' : 'w-11 h-11';
  return item.thumbnail ? (
    <img src={item.thumbnail} alt="" className={`${size} rounded-lg object-cover flex-shrink-0 bg-[#F3F4F6]`} />
  ) : (
    <span className={`${size} rounded-lg bg-white border border-[#E5E7EB] text-[#FF6115] flex items-center justify-center flex-shrink-0`}>
      <Icon icon={icon} width={small ? 18 : 20} height={small ? 18 : 20} />
    </span>
  );
}
