import { Icon } from '@iconify/react';
import EventFormSection from '../../../components/set-event/form/EventFormSection';
import SegmentedControl from '../../../components/set-event/form/SegmentedControl';
import EventFormBuilder from '../../../components/set-event/form/EventFormBuilder';
import TemplatePicker, { templatesToPresets } from '../../../components/set-event/form/TemplatePicker';
import { cloneFields, type FormTemplate } from '../../../data/formTemplates';
import type { SectionProps } from './formModel';

interface AttendeeFormSectionProps extends SectionProps {
  /** Master Regis Form templates. */
  templates: FormTemplate[];
}

// "Event Form" section: asks Yes / No first, and only then shows the form builder.
export default function AttendeeFormSection({ form, patch, errors, templates }: AttendeeFormSectionProps) {
  return (
    <EventFormSection
      id="section-event-form"
      icon="solar:document-add-linear"
      title="Event Form"
      description="Choose whether attendees need to provide additional information when registering for this event."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">Require Event Form?</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Does this event require an application or registration form?</p>
          </div>
          <SegmentedControl
            label="Require Event Form?"
            value={form.requireForm ? 'yes' : 'no'}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]}
            onChange={(v) => patch({ requireForm: v === 'yes' })}
          />
        </div>

        {!form.requireForm ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F9FAFB] border border-[#F0F0F0]">
            <Icon icon="solar:document-linear" width={22} height={22} className="text-[#9CA3AF] flex-shrink-0" />
            <p className="text-sm text-[#6B7280]">No additional form is required for this event.</p>
          </div>
        ) : (
          <div className="pt-6 border-t border-[#F0F0F0] space-y-5">
            <TemplatePicker
              templates={templates}
              currentId={form.formTemplateId}
              hasContent={form.formFields.length > 0}
              onApply={(t) => patch({ formName: t.name, formDescription: t.description, formFields: cloneFields(t.fields), formTemplateId: t.id })}
            />
            <EventFormBuilder
              name={form.formName}
              description={form.formDescription}
              fields={form.formFields}
              onChange={(p) =>
                patch({
                  ...(p.name !== undefined && { formName: p.name }),
                  ...(p.description !== undefined && { formDescription: p.description }),
                  ...(p.fields !== undefined && { formFields: p.fields }),
                  ...(p.templateId !== undefined && { formTemplateId: p.templateId }),
                })
              }
              errors={errors}
              nameError={errors.formName}
              fieldsError={errors.formFields}
              presets={templatesToPresets(templates)}
            />
          </div>
        )}
      </div>
    </EventFormSection>
  );
}
