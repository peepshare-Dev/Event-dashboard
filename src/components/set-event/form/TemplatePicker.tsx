import { useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import OptionPickerModal from '../OptionPickerModal';
import type { FormPreset } from './EventFormBuilder';
import type { FormTemplate } from '../../../data/formTemplates';

/** Master templates as builder quick-start chips. */
export const templatesToPresets = (templates: FormTemplate[]): FormPreset[] =>
  templates.map((t) => ({
    id: t.id,
    label: t.name,
    icon: t.kind === 'survey' ? 'solar:chat-square-like-linear' : 'solar:document-text-linear',
    formName: t.name,
    description: t.description,
    fields: t.fields,
  }));

interface TemplatePickerProps {
  templates: FormTemplate[];
  /** Template the current form came from, if any. */
  currentId: string;
  /** Asks before replacing fields that are already there. */
  hasContent: boolean;
  onApply: (template: FormTemplate) => void;
}

// "Based on …" + Use Template: copies a master Regis / Survey template into this event.
export default function TemplatePicker({ templates, currentId, hasContent, onApply }: TemplatePickerProps) {
  const [picking, setPicking] = useState(false);
  const [pending, setPending] = useState<FormTemplate | null>(null);
  const current = templates.find((t) => t.id === currentId);

  const choose = (id: string) => {
    const template = templates.find((t) => t.id === id);
    setPicking(false);
    if (!template) return;
    if (hasContent) setPending(template);
    else onApply(template);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#F0F0F0] bg-[#F9FAFB] px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-[#374151] min-w-0">
          <Icon icon="solar:copy-linear" width={18} height={18} className="text-[#9CA3AF] flex-shrink-0" />
          {current ? (
            <span className="truncate">
              Based on template <span className="font-semibold text-[#1A1A1A]">{current.name}</span>
            </span>
          ) : (
            <span>Reuse a form from the master template list.</span>
          )}
        </p>
        <Button variant="secondary" icon="solar:document-add-linear" onClick={() => setPicking(true)} disabled={templates.length === 0} className="h-9 sm:flex-shrink-0">
          {current ? 'Change Template' : 'Use Template'}
        </Button>
      </div>

      {picking && (
        <OptionPickerModal
          title="Use Template"
          icon="solar:document-add-linear"
          options={templates.map((t) => ({
            value: t.id,
            label: t.name,
            description: `${t.fields.length} ${t.fields.length === 1 ? 'field' : 'fields'}${t.description ? ` · ${t.description}` : ''}`,
          }))}
          initialValue={current?.id ?? null}
          confirmLabel="Use Template"
          onConfirm={choose}
          onClose={() => setPicking(false)}
        />
      )}

      {pending && (
        <Modal
          title="Replace current form?"
          onClose={() => setPending(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setPending(null)} autoFocus>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onApply(pending);
                  setPending(null);
                }}
              >
                Replace
              </Button>
            </>
          }
        >
          <p className="text-sm text-[#4B5563]">
            The name, description and fields of this form will be replaced with a copy of{' '}
            <span className="font-semibold text-[#1A1A1A]">{pending.name}</span>. The master template isn’t changed.
          </p>
        </Modal>
      )}
    </>
  );
}
