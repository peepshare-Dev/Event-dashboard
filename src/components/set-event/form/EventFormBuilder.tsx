import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Toggle from '../../ui/Toggle';
import SelectField, { type SelectOption } from './SelectField';
import { inputClass, textareaClass } from './FormField';
import type { EventFormField, FormFieldType } from '../../../data/setEvents';
import { useT } from '@/i18n';

export const FIELD_TYPES: SelectOption<FormFieldType>[] = [
  { value: 'short-text', label: 'Short Text', icon: 'solar:text-field-linear' },
  { value: 'long-text', label: 'Long Text', icon: 'solar:document-text-linear' },
  { value: 'single-choice', label: 'Single Choice', icon: 'solar:record-circle-linear' },
  { value: 'multiple-choice', label: 'Multiple Choice', icon: 'solar:checklist-minimalistic-linear' },
  { value: 'dropdown', label: 'Dropdown', icon: 'solar:list-arrow-down-linear' },
  { value: 'rating', label: 'Rating (Star)', icon: 'solar:star-linear' },
];

/** Section headings are added with their own button, not picked as a field type. */
const HEADING_TYPE: SelectOption<FormFieldType> = { value: 'heading', label: 'Section Heading', icon: 'solar:text-bold-linear' };

export const fieldTypeOption = (type: FormFieldType) => (type === 'heading' ? HEADING_TYPE : FIELD_TYPES.find((t) => t.value === type));

export const hasOptions = (type: FormFieldType) => type === 'single-choice' || type === 'multiple-choice' || type === 'dropdown';

/** Everything except section headings. */
export const isQuestion = (field: Pick<EventFormField, 'type'>) => field.type !== 'heading';

export const RATING_STARS = 5;

/** A starting point offered as a chip when the form has no fields yet. */
export interface FormPreset {
  /** Master template id, kept on the form as `templateId`. */
  id?: string;
  label: string;
  icon: string;
  formName: string;
  description?: string;
  fields: Omit<EventFormField, 'id'>[];
}

let nextFieldId = 0;
const newId = () => `field-${Date.now().toString(36)}-${(nextFieldId++).toString(36)}`;

interface EventFormBuilderProps {
  name: string;
  description: string;
  fields: EventFormField[];
  onChange: (patch: { name?: string; description?: string; fields?: EventFormField[]; templateId?: string }) => void;
  /** Field errors keyed `field:<id>` and `field:<id>:options`. */
  errors: Record<string, string | undefined>;
  nameError?: string;
  /** Shown when the form has no fields yet. */
  fieldsError?: string;
  presets?: FormPreset[];
  nameLabel?: string;
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
  descriptionLabel?: string;
  fieldsLabel?: string;
  addLabel?: string;
}

// Lightweight builder: a form name, a description and an ordered list of questions.
export default function EventFormBuilder({
  name,
  description,
  fields,
  onChange,
  errors,
  nameError,
  fieldsError,
  presets = [],
  nameLabel = 'Form Name',
  namePlaceholder = 'e.g. Application Form',
  descriptionPlaceholder = 'Tell attendees what this form is for and how their answers are used.',
  descriptionLabel = 'Form Description',
  fieldsLabel = 'Form Fields',
  addLabel = 'Add Form Field',
}: EventFormBuilderProps) {
  const t = useT();
  const id = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusId) return;
    listRef.current?.querySelector<HTMLInputElement>(`[data-field-label="${focusId}"]`)?.focus();
    setFocusId(null);
  }, [focusId]);

  const setFields = (next: EventFormField[]) => onChange({ fields: next });
  const update = (id: string, changes: Partial<EventFormField>) => setFields(fields.map((field) => (field.id === id ? { ...field, ...changes } : field)));
  const move = (index: number, by: -1 | 1) => {
    const next = [...fields];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    setFields(next);
  };
  const add = (type: FormFieldType = 'short-text') => {
    const id = newId();
    setFields([...fields, { id, label: '', description: '', type, required: type !== 'heading', options: [] }]);
    setFocusId(id);
  };
  const questionCount = fields.filter(isQuestion).length;
  const headingCount = fields.length - questionCount;
  // Questions are numbered 1, 2, 3… skipping section headings.
  const numbers = fields.reduce<number[]>((acc, f) => [...acc, (acc.at(-1) ?? 0) + (isQuestion(f) ? 1 : 0)], []);
  const applyPreset = (preset: FormPreset) =>
    onChange({
      name: name || preset.formName,
      description: description || (preset.description ?? ''),
      fields: preset.fields.map((field) => ({ ...field, id: newId(), options: [...field.options] })),
      templateId: preset.id,
    });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor={`${id}-name`} className="block text-sm font-medium text-[#1A1A1A] mb-2">
            {t(nameLabel)}
            <span className="text-[#DC2626] ml-0.5" aria-hidden="true">*</span>
            <span className="sr-only"> {t('(required)')}</span>
          </label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t(namePlaceholder)}
            aria-invalid={Boolean(nameError) || undefined}
            className={inputClass(Boolean(nameError))}
          />
          {nameError && <p className="mt-2 text-xs text-[#DC2626]">{t(nameError)}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-description`} className="block text-sm font-medium text-[#1A1A1A] mb-2">
            {t(descriptionLabel)}
          </label>
          <textarea
            id={`${id}-description`}
            rows={2}
            value={description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder={t(descriptionPlaceholder)}
            className={textareaClass()}
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h3 className="text-sm font-medium text-[#1A1A1A]">{t(fieldsLabel)}</h3>
          {fields.length > 0 && (
            <span className="text-xs text-[#6B7280]">
              {t(questionCount === 1 ? '{count} field' : '{count} fields', { count: questionCount })}
              {headingCount > 0 && ` · ${t(headingCount === 1 ? '{count} section' : '{count} sections', { count: headingCount })}`}
            </span>
          )}
        </div>

        {fields.length === 0 && (
          <div className={`rounded-xl border border-dashed p-4 sm:p-5 bg-[#F9FAFB] ${fieldsError ? 'border-[#DC2626]' : 'border-[#D1D5DB]'}`}>
            <p className="text-sm text-[#374151]">{presets.length ? t('Start from a template or add fields one by one.') : t('Add fields one by one.')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-full hover:border-[#FFB38F] hover:text-[#E5540F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                >
                  <Icon icon={preset.icon} width={15} height={15} />
                  {t(preset.label)}
                </button>
              ))}
            </div>
          </div>
        )}

        {fields.length > 0 && (
          <ol ref={listRef} className="space-y-3">
            {fields.map((field, index) => {
              const labelError = errors[`field:${field.id}`];
              const optionsError = errors[`field:${field.id}:options`];
              const actions = (
                <div className="flex items-center gap-1">
                  <FieldAction icon="solar:alt-arrow-up-linear" label={t('Move item {number} up', { number: index + 1 })} disabled={index === 0} onClick={() => move(index, -1)} />
                  <FieldAction icon="solar:alt-arrow-down-linear" label={t('Move item {number} down', { number: index + 1 })} disabled={index === fields.length - 1} onClick={() => move(index, 1)} />
                  <FieldAction icon="solar:trash-bin-trash-linear" label={t('Delete item {number}', { number: index + 1 })} destructive onClick={() => setFields(fields.filter((x) => x.id !== field.id))} />
                </div>
              );

              if (field.type === 'heading') {
                return (
                  <li key={field.id} className="rounded-xl border border-[#FFD9C4] border-l-4 border-l-[#FF6115] bg-[#FFFAF7]">
                    <div className="flex items-start gap-3 p-3 sm:p-4">
                      <span className="mt-3 w-6 h-6 rounded-md bg-[#FF6115] text-white text-xs font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        H
                      </span>
                      <div className="flex-1 min-w-0 grid grid-cols-1 gap-3">
                        <div>
                          <input
                            data-field-label={field.id}
                            value={field.label}
                            onChange={(e) => update(field.id, { label: e.target.value })}
                            placeholder={t('Section title, e.g. Personal Information')}
                            aria-label={t('Section heading {number} title', { number: index + 1 })}
                            aria-invalid={Boolean(labelError) || undefined}
                            className={`${inputClass(Boolean(labelError))} font-semibold`}
                          />
                          {labelError && <p className="mt-1.5 text-xs text-[#DC2626]">{t(labelError)}</p>}
                        </div>
                        <input
                          value={field.description}
                          onChange={(e) => update(field.id, { description: e.target.value })}
                          placeholder={t('Section description (optional)')}
                          aria-label={t('Section heading {number} description', { number: index + 1 })}
                          className={`${inputClass()} h-10`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2 border-t border-[#FFE4D4] rounded-b-xl">
                      <span className="pl-9 text-xs text-[#9CA3AF]">{t('Section heading · groups the questions below')}</span>
                      {actions}
                    </div>
                  </li>
                );
              }

              return (
                <li key={field.id} className="rounded-xl border border-[#E5E7EB] bg-white">
                  <div className="flex items-start gap-3 p-3 sm:p-4">
                    <span className="mt-3 w-6 h-6 rounded-full bg-[#F3F4F6] text-xs font-medium text-[#6B7280] flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      {numbers[index]}
                    </span>
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px] gap-3">
                      <div className="min-w-0">
                        <input
                          data-field-label={field.id}
                          value={field.label}
                          onChange={(e) => update(field.id, { label: e.target.value })}
                          placeholder={t('Field label, e.g. Full Name')}
                          aria-label={t('Field {number} label', { number: numbers[index] })}
                          aria-invalid={Boolean(labelError) || undefined}
                          className={inputClass(Boolean(labelError))}
                        />
                        {labelError && <p className="mt-1.5 text-xs text-[#DC2626]">{t(labelError)}</p>}
                      </div>
                      <SelectField
                        value={field.type}
                        options={FIELD_TYPES.map((o) => ({ ...o, label: t(o.label) }))}
                        placeholder={t('Field type')}
                        onChange={(type) => update(field.id, { type, options: hasOptions(type) && field.options.length === 0 ? [t('Option 1'), t('Option 2')] : field.options })}
                      />
                      <input
                        value={field.description}
                        onChange={(e) => update(field.id, { description: e.target.value })}
                        placeholder={t('Description (optional)')}
                        aria-label={t('Field {number} description', { number: numbers[index] })}
                        className={`${inputClass()} h-10 sm:col-span-2`}
                      />
                      {hasOptions(field.type) && (
                        <div className="sm:col-span-2">
                          <textarea
                            rows={3}
                            value={field.options.join('\n')}
                            onChange={(e) => update(field.id, { options: e.target.value.split('\n') })}
                            placeholder={t('One option per line')}
                            aria-label={t('Field {number} options, one per line', { number: numbers[index] })}
                            aria-invalid={Boolean(optionsError) || undefined}
                            className={textareaClass(Boolean(optionsError))}
                          />
                          <p className={`mt-1 text-xs ${optionsError ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`}>{optionsError ? t(optionsError) : t('One option per line.')}</p>
                        </div>
                      )}
                      {field.type === 'rating' && (
                        <div className="sm:col-span-2 rounded-lg bg-[#F9FAFB] px-4 py-3 text-center">
                          <p className="text-xs text-[#6B7280]">{t('Rating preview')}</p>
                          <div className="mt-1.5 flex justify-center gap-1.5" aria-label={t('{count}-star rating', { count: RATING_STARS })}>
                            {Array.from({ length: RATING_STARS }, (_, i) => (
                              <Icon key={i} icon="solar:star-linear" width={26} height={26} className="text-[#F59E0B]" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2 border-t border-[#F0F0F0] bg-[#FAFAFB] rounded-b-xl">
                    <div className="pl-9">
                      <Toggle checked={field.required} onChange={(required) => update(field.id, { required })} label={field.required ? t('Required') : t('Optional')} />
                    </div>
                    {actions}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {fieldsError && fields.length === 0 && <p className="mt-2 text-xs text-[#DC2626]">{t(fieldsError)}</p>}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-2">
          <button
            type="button"
            onClick={() => add('heading')}
            className="h-11 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:text-bold-linear" width={16} height={16} />
            {t('Add Section Heading')}
          </button>
          <button
            type="button"
            onClick={() => add()}
            className="h-11 inline-flex items-center justify-center gap-2 text-sm font-medium text-[#FF6115] border border-dashed border-[#FFB38F] rounded-xl hover:bg-[#FFF5EF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:add-linear" width={16} height={16} />
            {t(addLabel)}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldAction({ icon, label, disabled, destructive, onClick }: { icon: string; label: string; disabled?: boolean; destructive?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        destructive ? 'text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2]' : 'text-[#6B7280] hover:bg-[#F3F4F6]'
      }`}
    >
      <Icon icon={icon} width={18} height={18} />
    </button>
  );
}
