import { useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import OptionPickerModal from '../../../components/set-event/OptionPickerModal';
import SectionShell from './SectionShell';
import { mockCollections } from '../../Collections';
import type { SetEvent } from '../../../data/setEvents';

interface EventCollectionProps {
  event: SetEvent;
  onBack: () => void;
  onChange: (collectionId: number | null, message: string) => void;
}

export default function EventCollection({ event, onBack, onChange }: EventCollectionProps) {
  const [picking, setPicking] = useState(false);
  const collection = mockCollections.find((c) => c.id === event.details?.collectionId);

  return (
    <SectionShell
      event={event}
      title="Collection"
      onBack={onBack}
      actions={
        <Button pill icon={collection ? 'solar:refresh-circle-linear' : 'solar:add-linear'} onClick={() => setPicking(true)} className="w-full sm:w-auto">
          {collection ? 'Change collection' : 'Link collection'}
        </Button>
      }
    >
      {collection ? (
        <div className="rounded-xl bg-[#FFF0E8] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="w-12 h-12 rounded-xl bg-[#FF6115] flex items-center justify-center flex-shrink-0">
            <Icon icon="solar:folder-linear" width={26} height={26} className="text-white" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#6B7280]">Linked collection</p>
            <p className="text-base font-semibold text-[#1A1A1A] truncate">{collection.name}</p>
            <p className="text-sm text-[#4B5563] mt-1">
              {collection.files.toLocaleString()} files · {collection.storageGb} GB · Owner {collection.owner} · Updated {collection.lastUpdated}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null, `Collection unlinked from “${event.name}”`)}
            className="self-start sm:self-center h-9 px-4 text-sm text-[#DC2626] bg-white rounded-lg hover:bg-[#FEF2F2] transition-colors"
          >
            Unlink
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-12 px-4 border border-dashed border-[#E5E7EB] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
            <Icon icon="solar:folder-linear" width={24} height={24} className="text-[#FF6115]" />
          </div>
          <p className="text-sm font-semibold text-[#1A1A1A]">No collection linked</p>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            Link a Collection to share this event's photos and files with attendees.
          </p>
        </div>
      )}

      {picking && (
        <OptionPickerModal
          title="Select Collection"
          icon="solar:folder-linear"
          options={mockCollections.map((c) => ({ value: c.id, label: c.name, description: `${c.files.toLocaleString()} files · ${c.linkedEvent}` }))}
          initialValue={collection?.id ?? null}
          confirmLabel="Link collection"
          onConfirm={(id) => {
            const name = mockCollections.find((c) => c.id === id)?.name ?? 'Collection';
            onChange(id, `“${name}” linked to “${event.name}”`);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </SectionShell>
  );
}
