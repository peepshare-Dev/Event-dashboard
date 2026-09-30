import { useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SearchInput from '../ui/SearchInput';

export interface PickerOption<T> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface OptionPickerModalProps<T> {
  title: string;
  icon: string;
  options: PickerOption<T>[];
  initialValue?: T | null;
  confirmLabel: string;
  onConfirm: (value: T) => void;
  onClose: () => void;
}

// Single-choice list in a modal with search — used for Collections and Registration forms.
export default function OptionPickerModal<T extends string | number>({
  title,
  icon,
  options,
  initialValue = null,
  confirmLabel,
  onConfirm,
  onClose,
}: OptionPickerModalProps<T>) {
  const [selected, setSelected] = useState<T | null>(initialValue);
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const visible = options.filter((o) => !term || `${o.label} ${o.description ?? ''}`.toLowerCase().includes(term));

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={selected === null} onClick={() => selected !== null && onConfirm(selected)}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search" />
        <div role="radiogroup" aria-label={title} className="space-y-2 max-h-80 overflow-y-auto -mx-1 px-1">
          {visible.length === 0 && <p className="text-sm text-[#9CA3AF] text-center py-6">No results</p>}
          {visible.map((option) => {
            const isSelected = option.value === selected;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={option.disabled}
                onClick={() => setSelected(option.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected ? 'border-[#FF6115] bg-[#FFF5EF]' : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                }`}
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#FF6115] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                  <Icon icon={icon} width={18} height={18} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-[#1A1A1A] truncate">{option.label}</span>
                  {option.description && <span className="block text-xs text-[#6B7280] truncate">{option.description}</span>}
                </span>
                {isSelected && <Icon icon="solar:check-circle-bold" width={20} height={20} className="text-[#FF6115] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
