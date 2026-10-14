import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import SectionShell from './SectionShell';
import { mockCollections } from '../../Collections';
import { REGISTRATION_TYPE_LABELS, formatEventDateTime, type SetEvent } from '../../../data/setEvents';
import { useT } from '@/i18n';

interface EventOverviewProps {
  event: SetEvent;
  onBack: () => void;
  onEdit: () => void;
  onOpenQr: () => void;
}

// Same-day ranges show only the end time; multi-day ranges show the full end date.
const range = (start = '', end = '') =>
  start ? `${formatEventDateTime(start)} → ${!end ? '—' : end.slice(0, 10) === start.slice(0, 10) ? end.slice(11, 16) : formatEventDateTime(end)}` : '—';

export default function EventOverview({ event, onBack, onEdit, onOpenQr }: EventOverviewProps) {
  const t = useT();
  const d = event.details;
  const collection = mockCollections.find((c) => c.id === d?.collectionId);

  const stats = [
    { label: t('Registrants'), value: event.registrants.toLocaleString(), icon: 'solar:users-group-rounded-linear' },
    { label: t('Registration forms'), value: String((d?.registrationForms.length ?? 0) + (d?.eventForm?.enabled ? 1 : 0)), icon: 'solar:document-text-linear' },
    { label: t('QR links'), value: String(d?.qrLinks?.length ?? 0), icon: 'solar:qr-code-linear', onClick: onOpenQr },
    { label: t('Collection files'), value: collection ? collection.files.toLocaleString() : '—', icon: 'solar:folder-linear' },
  ];

  const venue = [d?.venueName, d?.latitude && d?.longitude ? `${d.latitude}, ${d.longitude}` : ''].filter(Boolean).join(' · ');
  const details: [string, string][] = [
    [t('Event date'), range(event.startTime, event.endTime)],
    [t('Registration period'), range(d?.registrationOpensAt || d?.registrationStart, d?.registrationClosesAt || d?.registrationEnd)],
    [t('Event type'), d?.eventType ? t(d.eventType) : '—'],
    [t('Organizer'), event.category || '—'],
    [t('Registration'), d?.registrationType ? t(REGISTRATION_TYPE_LABELS[d.registrationType]) : t(event.ticketType)],
    [t('Capacity'), d?.maxParticipants != null ? t('{count} people', { count: d.maxParticipants.toLocaleString() }) : d?.registrationType ? t('Unlimited') : '—'],
    [t('Author'), event.author],
    [t('Allow join'), d ? (d.allowJoin ? t('Active') : t('Closed')) : '—'],
    [t('Send survey'), formatEventDateTime(d?.surveySendTime ?? '')],
    [t('QR code expires'), formatEventDateTime(d?.qrExpiresAt ?? '')],
    [t('Event format'), d?.eventFormat ? t(d.eventFormat) : '—'],
    [t('Location'), venue || '—'],
    ...(d?.onlineUrl ? [[t('Online'), [d.onlinePlatform, d.onlineUrl].filter(Boolean).join(' · ')] as [string, string]] : []),
    [t('Collection'), collection?.name ?? '—'],
    [
      t('Automated messages'),
      d?.communication?.enabled ? t('{count} active', { count: d.communication.automations.filter((a) => a.enabled).length }) : t('Off'),
    ],
  ];

  return (
    <SectionShell
      event={event}
      title="Overview"
      onBack={onBack}
      actions={
        <Button pill variant="secondary" icon="solar:pen-new-square-linear" onClick={onEdit}>
          {t('Edit event')}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => {
            const body = (
              <>
                <span className="w-12 h-12 shrink-0 rounded-xl bg-[#FFF0E8] text-[#FF6115] flex items-center justify-center">
                  <Icon icon={s.icon} width={24} height={24} />
                </span>
                <span className="min-w-0 text-right">
                  <span className="block text-sm text-[#6B7280] truncate">{s.label}</span>
                  <span className="block mt-0.5 text-2xl font-semibold text-[#1A1A1A] tabular-nums">{s.value}</span>
                </span>
              </>
            );
            return s.onClick ? (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                className="flex items-center justify-between gap-3 text-left p-4 rounded-xl border border-[#E5E7EB] hover:border-[#FFB38F] hover:bg-[#FFFBF8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
              >
                {body}
              </button>
            ) : (
              <div key={s.label} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-[#E5E7EB]">
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
