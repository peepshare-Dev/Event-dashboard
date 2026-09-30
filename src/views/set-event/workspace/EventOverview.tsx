import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import SectionShell from './SectionShell';
import { mockCollections } from '../../Collections';
import { formatEventDateTime, type SetEvent } from '../../../data/setEvents';

interface EventOverviewProps {
  event: SetEvent;
  onBack: () => void;
  onEdit: () => void;
  onOpenQr: () => void;
}

const range = (start = '', end = '') => (start ? `${formatEventDateTime(start)} → ${end ? end.slice(11, 16) : '—'}` : '—');

export default function EventOverview({ event, onBack, onEdit, onOpenQr }: EventOverviewProps) {
  const d = event.details;
  const collection = mockCollections.find((c) => c.id === d?.collectionId);

  const stats = [
    { label: 'Registrants', value: event.registrants.toLocaleString(), icon: 'solar:users-group-rounded-linear' },
    { label: 'Registration forms', value: String(d?.registrationForms.length ?? 0), icon: 'solar:document-text-linear' },
    { label: 'QR links', value: String(d?.qrLinks?.length ?? 0), icon: 'solar:qr-code-linear', onClick: onOpenQr },
    { label: 'Collection files', value: collection ? collection.files.toLocaleString() : '—', icon: 'solar:folder-linear' },
  ];

  const details: [string, string][] = [
    ['Event date', range(event.startTime, event.endTime)],
    ['Registration deadline', range(d?.registrationStart, d?.registrationEnd)],
    ['Category', event.category || '—'],
    ['Ticket type', event.ticketType],
    ['Author', event.author],
    ['Allow join', d ? (d.allowJoin ? 'Active' : 'Closed') : '—'],
    ['Send survey', formatEventDateTime(d?.surveySendTime ?? '')],
    ['QR code expires', formatEventDateTime(d?.qrExpiresAt ?? '')],
    ['Location', d?.latitude && d?.longitude ? `${d.latitude}, ${d.longitude}` : '—'],
    ['Collection', collection?.name ?? '—'],
  ];

  return (
    <SectionShell
      event={event}
      title="Overview"
      onBack={onBack}
      actions={
        <Button pill variant="secondary" icon="solar:pen-new-square-linear" onClick={onEdit}>
          Edit event
        </Button>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">{event.name || 'Untitled'}</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Event ID {event.id}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => {
            const body = (
              <>
                <span className="w-9 h-9 rounded-lg bg-[#FFF0E8] text-[#FF6115] flex items-center justify-center">
                  <Icon icon={s.icon} width={18} height={18} />
                </span>
                <span className="block mt-3 text-2xl font-semibold text-[#1A1A1A] tabular-nums">{s.value}</span>
                <span className="block text-sm text-[#6B7280]">{s.label}</span>
              </>
            );
            return s.onClick ? (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                className="text-left p-4 rounded-xl border border-[#E5E7EB] hover:border-[#FFB38F] hover:bg-[#FFFBF8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
              >
                {body}
              </button>
            ) : (
              <div key={s.label} className="p-4 rounded-xl border border-[#E5E7EB]">
                {body}
              </div>
            );
          })}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t border-[#F0F0F0]">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3 border-b border-[#F0F0F0] text-sm">
              <dt className="text-[#6B7280]">{label}</dt>
              <dd className="text-[#1A1A1A] text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionShell>
  );
}
