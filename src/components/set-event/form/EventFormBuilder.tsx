import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Toggle from '../../ui/Toggle';
import SelectField, { type SelectOption } from './SelectField';
import { inputClass, textareaClass } from './FormField';
import type { EventFormField, FormFieldType } from '../../../data/setEvents';

export const FIELD_TYPES: SelectOption<FormFieldType>[] = [
  { value: 'short-text', label: 'Short Text', icon: 'solar:text-field-linear' },
  { value: 'long-text', label: 'Long Text', icon: 'solar:document-text-linear' },
  { value: 'number', label: 'Number', icon: 'solar:hashtag-linear' },
  { value: 'email', label: 'Email', icon: 'solar:letter-linear' },
  { value: 'phone', label: 'Phone Number', icon: 'solar:phone-linear' },
  { value: 'date', label: 'Date', icon: 'solar:calendar-linear' },
  { value: 'single-choice', label: 'Single Choice', icon: 'solar:record-circle-linear' },
  { value: 'multiple-choice', label: 'Multiple Choice', icon: 'solar:checklist-minimalistic-linear' },
  { value: 'dropdown', label: 'Dropdown', icon: 'solar:list-arrow-down-linear' },
  { value: 'file', label: 'File Upload', icon: 'solar:upload-linear' },
];

export const hasOptions = (type: FormFieldType) => type === 'single-choice' || type === 'multiple-choice' || type === 'dropdown';

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
  const add = () => {
    const id = newId();
    setFields([...fields, { id, label: '', description: '', type: 'short-text', required: true, options: [] }]);
    setFocusId(id);
  };
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
            {nameLabel}
            <span className="text-[#DC2626] ml-0.5" aria-hidden="true">*</span>
            <span className="sr-only"> (required)</span>
          </label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={namePlaceholder}
            aria-invalid={Boolean(nameError) || undefined}
            className={inputClass(Boolean(nameError))}
          />
          {nameError && <p className="mt-2 text-xs text-[#DC2626]">{nameError}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-description`} className="block text-sm font-medium text-[#1A1A1A] mb-2">
            {descriptionLabel}
          </label>
          <textarea
            id={`${id}-description`}
            rows={2}
            value={description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder={descriptionPlaceholder}
            className={textareaClass()}
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h3 className="text-sm font-medium text-[#1A1A1A]">{fieldsLabel}</h3>
          {fields.length > 0 && <span className="text-xs text-[#6B7280]">{fields.length} {fields.length === 1 ? 'field' : 'fields'}</span>}
        </div>

        {fields.length === 0 && (
          <div className={`rounded-xl border border-dashed p-4 sm:p-5 bg-[#F9FAFB] ${fieldsError ? 'border-[#DC2626]' : 'border-[#D1D5DB]'}`}>
            <p className="text-sm text-[#374151]">{presets.length ? 'Start from a template or add fields one by one.' : 'Add fields one by one.'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-full hover:border-[#FFB38F] hover:text-[#E5540F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                >
                  <Icon icon={preset.icon} width={15} height={15} />
                  {preset.label}
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
              return (
                <li key={field.id} className="rounded-xl border border-[#E5E7EB] bg-white">
                  <div className="flex items-start gap-3 p-3 sm:p-4">
                    <span className="mt-3 w-6 h-6 rounded-full bg-[#F3F4F6] text-xs font-medium text-[#6B7280] flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px] gap-3">
                      <div className="min-w-0">
                        <input
                          data-field-label={field.id}
                          value={field.label}
                          onChange={(e) => update(field.id, { label: e.target.value })}
                          placeholder="Field label, e.g. Full Name"
                          aria-label={`Field ${index + 1} label`}
                          aria-invalid={Boolean(labelError) || undefined}
                          className={inputClass(Boolean(labelError))}
                        />
                        {labelError && <p className="mt-1.5 text-xs text-[#DC2626]">{labelError}</p>}
                      </div>
                      <SelectField
                        value={field.type}
                        options={FIELD_TYPES}
                        placeholder="Field type"
                        onChange={(type) => update(field.id, { type, options: hasOptions(type) && field.options.length === 0 ? ['Option 1', 'Option 2'] : field.options })}
                      />
                      <input
                        value={field.description}
                        onChange={(e) => update(field.id, { description: e.target.value })}
                        placeholder="Description (optional)"
                        aria-label={`Field ${index + 1} description`}
                        className={`${inputClass()} h-10 sm:col-span-2`}
                      />
                      {hasOptions(field.type) && (
                        <div className="sm:col-span-2">
                          <textarea
                            rows={3}
                            value={field.options.join('\n')}
                            onChange={(e) => update(field.id, { options: e.target.value.split('\n') })}
                            placeholder={'One option per line'}
                            aria-label={`Field ${index + 1} options, one per line`}
                            aria-invalid={Boolean(optionsError) || undefined}
                            className={textareaClass(Boolean(optionsError))}
                          />
                          <p className={`mt-1 text-xs ${optionsError ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`}>{optionsError ?? 'One option per line.'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2 border-t border-[#F0F0F0] bg-[#FAFAFB] rounded-b-xl">
                    <div className="pl-9">
                      <Toggle checked={field.required} onChange={(required) => update(field.id, { required })} label={field.required ? 'Required' : 'Optional'} />
                    </div>
                    <div className="flex items-center gap-1">
                      <FieldAction icon="solar:alt-arrow-up-linear" label={`Move field ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)} />
                      <FieldAction icon="solar:alt-arrow-down-linear" label={`Move field ${index + 1} down`} disabled={index === fields.length - 1} onClick={() => move(index, 1)} />
                      <FieldAction icon="solar:trash-bin-trash-linear" label={`Delete field ${index + 1}`} destructive onClick={() => setFields(fields.filter((x) => x.id !== field.id))} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {fieldsError && fields.length === 0 && <p className="mt-2 text-xs text-[#DC2626]">{fieldsError}</p>}

        <button
          type="button"
          onClick={add}
          className="mt-3 w-full h-11 inline-flex items-center justify-center gap-2 text-sm font-medium text-[#FF6115] border border-dashed border-[#FFB38F] rounded-xl hover:bg-[#FFF5EF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
        >
          <Icon icon="solar:add-linear" width={16} height={16} />
          {addLabel}
        </button>
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
