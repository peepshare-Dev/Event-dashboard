import { useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import OptionPickerModal from '../OptionPickerModal';
import type { FormPreset } from './EventFormBuilder';
import type { FormTemplate } from '../../../data/formTemplates';
import { useT } from '@/i18n';

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
  const t = useT();
  const [picking, setPicking] = useState(false);
  const [pending, setPending] = useState<FormTemplate | null>(null);
  const current = templates.find((tpl) => tpl.id === currentId);
  const [basedOnBefore, basedOnAfter = ''] = t('Based on template {name}').split('{name}');
  const [replaceBefore, replaceAfter = ''] = t('The name, description and fields of this form will be replaced with a copy of {name}. The master template isn’t changed.').split('{name}');

  const choose = (id: string) => {
    const template = templates.find((tpl) => tpl.id === id);
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
              {basedOnBefore}<span className="font-semibold text-[#1A1A1A]">{t(current.name)}</span>{basedOnAfter}
            </span>
          ) : (
            <span>{t('Reuse a form from the master template list.')}</span>
          )}
        </p>
        <Button variant="secondary" icon="solar:document-add-linear" onClick={() => setPicking(true)} disabled={templates.length === 0} className="h-9 sm:flex-shrink-0">
          {current ? t('Change Template') : t('Use Template')}
        </Button>
      </div>

      {picking && (
        <OptionPickerModal
          title={t('Use Template')}
          icon="solar:document-add-linear"
          options={templates.map((tpl) => ({
            value: tpl.id,
            label: t(tpl.name),
            description: `${t(tpl.fields.length === 1 ? '{count} field' : '{count} fields', { count: tpl.fields.length })}${tpl.description ? ` · ${t(tpl.description)}` : ''}`,
          }))}
          initialValue={current?.id ?? null}
          confirmLabel={t('Use Template')}
          onConfirm={choose}
          onClose={() => setPicking(false)}
        />
      )}

      {pending && (
        <Modal
          title={t('Replace current form?')}
          onClose={() => setPending(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setPending(null)} autoFocus>
                {t('Cancel')}
              </Button>
              <Button
                onClick={() => {
                  onApply(pending);
                  setPending(null);
                }}
              >
                {t('Replace')}
              </Button>
            </>
          }
        >
          <p className="text-sm text-[#4B5563]">
            {replaceBefore}
            <span className="font-semibold text-[#1A1A1A]">{t(pending.name)}</span>
            {replaceAfter}
          </p>
        </Modal>
      )}
    </>
  );
}
