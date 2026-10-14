import { Icon } from '@iconify/react';
import EventFormSection from '../../../components/set-event/form/EventFormSection';
import FormField from '../../../components/set-event/form/FormField';
import SegmentedControl from '../../../components/set-event/form/SegmentedControl';
import EventFormBuilder from '../../../components/set-event/form/EventFormBuilder';
import TemplatePicker, { templatesToPresets } from '../../../components/set-event/form/TemplatePicker';
import { cloneFields, type FormTemplate } from '../../../data/formTemplates';
import { DateTimeInput } from '../../../components/set-event/form/DateTimeRange';
import type { SectionProps } from './formModel';
import { useT } from '@/i18n';

interface SurveyFormSectionProps extends SectionProps {
  /** Master Survey Form templates. */
  templates: FormTemplate[];
}

// "Survey Form" section: Yes / No first; Yes shows when to send it and the survey questions.
export default function SurveyFormSection({ form, patch, errors, templates }: SurveyFormSectionProps) {
  const t = useT();
  return (
    <EventFormSection
      id="section-survey-form"
      icon="solar:chat-square-like-linear"
      title={t('Survey Form')}
      description={t('Choose whether attendees receive a feedback survey after the event.')}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">{t('Send Survey Form?')}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{t('Collect feedback and satisfaction ratings from attendees after the event.')}</p>
          </div>
          <SegmentedControl
            label={t('Send Survey Form?')}
            value={form.requireSurvey ? 'yes' : 'no'}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]}
            onChange={(v) => patch({ requireSurvey: v === 'yes' })}
          />
        </div>

        {!form.requireSurvey ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F9FAFB] border border-[#F0F0F0]">
            <Icon icon="solar:document-linear" width={22} height={22} className="text-[#9CA3AF] flex-shrink-0" />
            <p className="text-sm text-[#6B7280]">{t('No survey will be sent for this event.')}</p>
          </div>
        ) : (
          <div className="pt-6 border-t border-[#F0F0F0] space-y-6">
            <FormField label={t('Send Survey')} required hint={t('Attendees receive the survey link at this time, usually after the event ends.')} error={errors.surveySend} asGroup>
              {() => (
                <DateTimeInput
                  value={{ date: form.surveyDate, time: form.surveyTime }}
                  min={form.eventStartDate}
                  invalid={Boolean(errors.surveySend)}
                  onChange={(p) => patch({ surveyDate: p.date ?? form.surveyDate, surveyTime: p.time ?? form.surveyTime })}
                  className="md:w-1/2 md:pr-[21px]"
                />
              )}
            </FormField>
            <TemplatePicker
              templates={templates}
              currentId={form.surveyTemplateId}
              hasContent={form.surveyFields.length > 0}
              onApply={(tpl) => patch({ surveyName: tpl.name, surveyDescription: tpl.description, surveyFields: cloneFields(tpl.fields), surveyTemplateId: tpl.id })}
            />
            <EventFormBuilder
              name={form.surveyName}
              description={form.surveyDescription}
              fields={form.surveyFields}
              onChange={(p) =>
                patch({
                  ...(p.name !== undefined && { surveyName: p.name }),
                  ...(p.description !== undefined && { surveyDescription: p.description }),
                  ...(p.fields !== undefined && { surveyFields: p.fields }),
                  ...(p.templateId !== undefined && { surveyTemplateId: p.templateId }),
                })
              }
              errors={errors}
              nameError={errors.surveyName}
              fieldsError={errors.surveyFields}
              presets={templatesToPresets(templates)}
              nameLabel={t('Survey Name')}
              descriptionLabel={t('Survey Description')}
              fieldsLabel={t('Survey Questions')}
              addLabel={t('Add Question')}
              namePlaceholder={t('e.g. Post-event Feedback')}
              descriptionPlaceholder={t('Thank attendees and tell them how their feedback will be used.')}
            />
          </div>
        )}
      </div>
    </EventFormSection>
  );
}
