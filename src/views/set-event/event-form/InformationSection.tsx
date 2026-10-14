import EventFormSection from '../../../components/set-event/form/EventFormSection';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import SelectField from '../../../components/set-event/form/SelectField';
import RichTextEditor from '../../../components/set-event/RichTextEditor';
import BannerDropzone from '../../../components/set-event/BannerDropzone';
import { EVENT_CATEGORIES, EVENT_TYPES } from '../../../data/setEvents';
import type { SectionProps } from './formModel';
import { useT } from '@/i18n';

const typeOptions = EVENT_TYPES.map((t) => ({ value: t, label: t }));
const categoryOptions = EVENT_CATEGORIES.map((c) => ({ value: c, label: c }));

interface InformationSectionProps extends SectionProps {
  /** Page-level controls (status, preview, full screen) shown in this first card's header. */
  headerActions?: React.ReactNode;
}

export default function InformationSection({ form, patch, errors, headerActions }: InformationSectionProps) {
  const t = useT();
  return (
    <EventFormSection
      id="section-information"
      icon="solar:info-circle-linear"
      title={t('Event Information')}
      description={t('Basic information about your event.')}
      actions={headerActions}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
        <FormField label={t('Event Name')} required error={errors.name} className="md:col-span-2">
          {(id) => (
            <input
              id={id}
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder={t('Enter event name')}
              aria-invalid={Boolean(errors.name) || undefined}
              className={inputClass(Boolean(errors.name))}
            />
          )}
        </FormField>

        <FormField label={t('Event Type')} required error={errors.eventType}>
          {(id) => (
            <SelectField
              id={id}
              value={form.eventType}
              options={typeOptions}
              onChange={(eventType) => patch({ eventType })}
              placeholder={t('Select event type')}
              icon="solar:star-linear"
              invalid={Boolean(errors.eventType)}
            />
          )}
        </FormField>

        <FormField label={t('Organizer')} required error={errors.category}>
          {(id) => (
            <SelectField
              id={id}
              value={form.category}
              options={categoryOptions}
              onChange={(category) => patch({ category })}
              placeholder={t('Select Organizer')}
              icon="solar:layers-linear"
              invalid={Boolean(errors.category)}
            />
          )}
        </FormField>

        <FormField label={t('Description')} className="md:col-span-2" asGroup>
          {() => <RichTextEditor defaultValue={form.description} onChange={(description) => patch({ description })} ariaLabel={t('Description')} />}
        </FormField>

        <FormField label={t('Banner Image')} className="md:col-span-2" asGroup>
          {() => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BannerDropzone title={t('Banner in Event Detail')} value={form.banner} onChange={(banner) => patch({ banner })} />
              <BannerDropzone
                title={t('Banner in Card Event')}
                suggestedSize="200 × 100 px (2:1)"
                aspect="wide"
                value={form.cardBanner}
                onChange={(cardBanner) => patch({ cardBanner })}
              />
            </div>
          )}
        </FormField>
      </div>
    </EventFormSection>
  );
}
