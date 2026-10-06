import { useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../ui/Button';
import OptionPickerModal from '../OptionPickerModal';
import { mockCollections } from '../../../views/Collections';

interface CollectionSelectorProps {
  value: number | null;
  onChange: (collectionId: number | null) => void;
}

// Shows the linked Collection as a highlighted card, or an empty state with Select Collection.
export default function CollectionSelector({ value, onChange }: CollectionSelectorProps) {
  const [picking, setPicking] = useState(false);
  const selected = mockCollections.find((c) => c.id === value);

  return (
    <>
      {selected ? (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-xl bg-[#FFF0E8] border border-[#FFD9C4]">
          <span className="w-11 h-11 rounded-[10px] bg-[#FF6115] flex items-center justify-center flex-shrink-0">
            <Icon icon="solar:folder-linear" width={22} height={22} className="text-white" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs text-[#6B7280]">Collection</span>
            <span className="block text-sm font-semibold text-[#1A1A1A] truncate">{selected.name}</span>
            <span className="block text-xs text-[#6B7280] truncate">
              {selected.files.toLocaleString()} files · {selected.storageGb} GB
            </span>
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" onClick={() => onChange(null)} className="h-9 text-[#6B7280]">
              Remove
            </Button>
            <Button variant="secondary" onClick={() => setPicking(true)} className="h-9">
              Change
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB]">
          <span className="w-11 h-11 rounded-[10px] bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
            <Icon icon="solar:folder-linear" width={22} height={22} className="text-[#9CA3AF]" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-[#374151]">No collection selected</span>
            <span className="block text-xs text-[#6B7280]">Photos and files for this event will be stored in the Collection you choose.</span>
          </span>
          <Button icon="solar:add-linear" variant="secondary" onClick={() => setPicking(true)} className="sm:flex-shrink-0">
            Select Collection
          </Button>
        </div>
      )}

      {picking && (
        <OptionPickerModal
          title="Select Collection"
          icon="solar:folder-linear"
          options={mockCollections.map((c) => ({ value: c.id, label: c.name, description: `${c.files.toLocaleString()} files · ${c.linkedEvent}` }))}
          initialValue={value}
          confirmLabel="Select Collection"
          onConfirm={(id) => {
            onChange(id);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </>
  );
}
