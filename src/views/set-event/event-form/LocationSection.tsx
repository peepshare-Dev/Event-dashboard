import { Icon } from '@iconify/react';
import EventFormSection from '../../../components/set-event/form/EventFormSection';
import FormField, { inputClass, textareaClass } from '../../../components/set-event/form/FormField';
import SelectField from '../../../components/set-event/form/SelectField';
import ChoiceCards from '../../../components/set-event/form/ChoiceCards';
import { ONLINE_PLATFORMS, type EventFormat } from '../../../data/setEvents';
import { coordsFromMapLink, hasOnlineLocation, hasPhysicalLocation, validateUrl, type SectionProps } from './formModel';

const FORMAT_OPTIONS: { value: EventFormat; label: string; description: string; icon: string }[] = [
  { value: 'Offline', label: 'Offline', description: 'At a physical venue.', icon: 'solar:map-point-linear' },
  { value: 'Online', label: 'Online', description: 'Streamed or held online.', icon: 'solar:monitor-linear' },
  { value: 'Hybrid', label: 'Hybrid', description: 'At a venue and online.', icon: 'solar:global-linear' },
];

const platformOptions = ONLINE_PLATFORMS.map((p) => ({ value: p, label: p }));

export default function LocationSection({ form, patch, errors }: SectionProps) {
  const physical = hasPhysicalLocation(form.eventFormat);
  const online = hasOnlineLocation(form.eventFormat);
  const hybrid = form.eventFormat === 'Hybrid';

  return (
    <EventFormSection id="section-location" icon="solar:map-point-linear" title="Location" description="Tell attendees where your event will take place.">
      <div className="space-y-6">
        <FormField label="Event Format" required error={errors.eventFormat} asGroup>
          {() => (
            <ChoiceCards
              label="Event Format"
              value={form.eventFormat}
              options={FORMAT_OPTIONS}
              onChange={(eventFormat) => patch({ eventFormat })}
              invalid={Boolean(errors.eventFormat)}
              columns="sm:grid-cols-3"
            />
          )}
        </FormField>

        {!form.eventFormat && (
          <p className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Icon icon="solar:info-circle-linear" width={16} height={16} className="flex-shrink-0" />
            Choose a format to add the venue or online details.
          </p>
        )}

        {physical && (
          <div className={hybrid ? 'rounded-xl border border-[#E5E7EB] p-4 sm:p-5' : ''}>
            {hybrid && <SubHeading icon="solar:map-point-linear" title="Physical Location" />}
            <PhysicalLocationFields form={form} patch={patch} errors={errors} />
          </div>
        )}

        {online && (
          <div className={hybrid ? 'rounded-xl border border-[#E5E7EB] p-4 sm:p-5' : ''}>
            {hybrid && <SubHeading icon="solar:monitor-linear" title="Online Event Information" />}
            <OnlineFields form={form} patch={patch} errors={errors} />
          </div>
        )}
      </div>
    </EventFormSection>
  );
}

function SubHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <h3 className="flex items-center gap-2 mb-4 text-[15px] font-semibold text-[#1A1A1A]">
      <Icon icon={icon} width={18} height={18} className="text-[#6B7280]" aria-hidden="true" />
      {title}
    </h3>
  );
}

function PhysicalLocationFields({ form, patch, errors }: SectionProps) {
  // A pasted Google Maps link that carries coordinates fills in Latitude / Longitude.
  const changeMapLink = (mapLink: string) => {
    const coords = coordsFromMapLink(mapLink);
    patch(coords ? { mapLink, ...coords } : { mapLink });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
      <FormField label="Venue Name" required error={errors.venueName} className="md:col-span-2">
        {(id) => (
          <input
            id={id}
            value={form.venueName}
            onChange={(e) => patch({ venueName: e.target.value })}
            placeholder="e.g. Impact Arena, Muang Thong Thani"
            aria-invalid={Boolean(errors.venueName) || undefined}
            className={inputClass(Boolean(errors.venueName))}
          />
        )}
      </FormField>

      <FormField label="Address" className="md:col-span-2">
        {(id) => (
          <textarea
            id={id}
            rows={2}
            value={form.address}
            onChange={(e) => patch({ address: e.target.value })}
            placeholder="Street, district, province, postal code"
            className={textareaClass()}
          />
        )}
      </FormField>

      <FormField label="Google Maps Link" hint="Paste a link with coordinates to fill in Latitude and Longitude." error={errors.mapLink} className="md:col-span-2">
        {(id) => (
          <div
            className={`flex h-12 bg-white border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#FF6115]/30 focus-within:border-[#FF6115] ${
              errors.mapLink ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
            }`}
          >
            <input
              id={id}
              type="url"
              inputMode="url"
              value={form.mapLink}
              onChange={(e) => changeMapLink(e.target.value)}
              placeholder="https://maps.google.com/..."
              aria-invalid={Boolean(errors.mapLink) || undefined}
              className="flex-1 min-w-0 px-3 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => window.open(form.mapLink.trim(), '_blank', 'noopener,noreferrer')}
              disabled={!form.mapLink.trim() || Boolean(validateUrl(form.mapLink))}
              aria-label="Open link in Google Maps"
              title="Open link in Google Maps"
              className="w-14 flex items-center justify-center flex-shrink-0 text-[#FF6115] bg-[#FFF0E8] hover:bg-[#FFE4D4] transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF6115]/40"
            >
              <Icon icon="solar:link-linear" width={22} height={22} />
            </button>
          </div>
        )}
      </FormField>

      <FormField label="Latitude" error={errors.latitude}>
        {(id) => (
          <input
            id={id}
            inputMode="decimal"
            value={form.latitude}
            onChange={(e) => patch({ latitude: e.target.value })}
            placeholder="e.g. 13.7466"
            aria-invalid={Boolean(errors.latitude) || undefined}
            className={inputClass(Boolean(errors.latitude))}
          />
        )}
      </FormField>
      <FormField label="Longitude" error={errors.longitude}>
        {(id) => (
          <input
            id={id}
            inputMode="decimal"
            value={form.longitude}
            onChange={(e) => patch({ longitude: e.target.value })}
            placeholder="e.g. 100.5393"
            aria-invalid={Boolean(errors.longitude) || undefined}
            className={inputClass(Boolean(errors.longitude))}
          />
        )}
      </FormField>

      <div className="md:col-span-2">
        <MapPreview latitude={form.latitude} longitude={form.longitude} />
      </div>
    </div>
  );
}

function OnlineFields({ form, patch, errors }: SectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
      <FormField label="Online Platform">
        {(id) => (
          <SelectField
            id={id}
            value={form.onlinePlatform}
            options={platformOptions}
            onChange={(onlinePlatform) => patch({ onlinePlatform })}
            placeholder="Select platform"
            icon="solar:videocamera-record-linear"
          />
        )}
      </FormField>
      <FormField label="Meeting / Event URL" required error={errors.onlineUrl}>
        {(id) => (
          <input
            id={id}
            type="url"
            inputMode="url"
            value={form.onlineUrl}
            onChange={(e) => patch({ onlineUrl: e.target.value })}
            placeholder="https://"
            aria-invalid={Boolean(errors.onlineUrl) || undefined}
            className={inputClass(Boolean(errors.onlineUrl))}
          />
        )}
      </FormField>
      <FormField label="Access Instructions" hint="Shared with registered attendees, e.g. passcode or when the link opens." className="md:col-span-2">
        {(id) => (
          <textarea
            id={id}
            rows={3}
            value={form.accessInstructions}
            onChange={(e) => patch({ accessInstructions: e.target.value })}
            placeholder="e.g. Passcode 2026. The room opens 15 minutes before the start time."
            className={textareaClass()}
          />
        )}
      </FormField>
    </div>
  );
}

function MapPreview({ latitude, longitude }: { latitude: string; longitude: string }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const valid =
    latitude.trim() !== '' && longitude.trim() !== '' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  if (!valid) {
    return (
      <div className="h-44 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-2 px-4 text-center">
        <Icon icon="solar:map-point-linear" width={28} height={28} className="text-[#9CA3AF]" />
        <p className="text-xs text-[#6B7280]">Enter latitude & longitude or paste a Google Maps link to preview the location.</p>
      </div>
    );
  }
  return (
    <iframe
      title="Event location map"
      src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="w-full h-56 rounded-xl border border-[#E5E7EB]"
    />
  );
}
