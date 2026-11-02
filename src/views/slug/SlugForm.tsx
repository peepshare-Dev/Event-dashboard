import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import EventFormSection from '../../components/set-event/form/EventFormSection';
import FormField, { inputClass, textareaClass } from '../../components/set-event/form/FormField';
import StickyActionBar from '../../components/set-event/form/StickyActionBar';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import { parseJson } from './slugJson';
import { slugApi, type SlugValue } from '../../data/mock/slugApi';
import type { Translate } from '../../data/appBanners';
import { useT } from '@/i18n';

const CONTENT_WIDTH = 'max-w-[960px]';

interface Draft {
  title: string;
  slug: string;
  value: string;
}

type Errors = Partial<Record<keyof Draft, string>>;

function validate(d: Draft, others: SlugValue[], t: Translate): Errors {
  const e: Errors = {};
  if (!d.title.trim()) e.title = t('Enter a title.');
  const slug = d.slug.trim();
  if (!slug) e.slug = t('Enter a slug.');
  else if (others.some((s) => s.slug.toLowerCase() === slug.toLowerCase())) e.slug = t('This slug is already in use.');
  if (!d.value.trim()) e.value = t('Enter a value.');
  else if (!parseJson(d.value).ok) e.value = t('The value must be valid JSON.');
  return e;
}

interface SlugFormProps {
  /** Omit to create one. */
  item?: SlugValue;
  allItems: SlugValue[];
  onDirtyChange: (dirty: boolean) => void;
  onCancel: () => void;
  onSaved: (item: SlugValue, created: boolean) => void;
}

// One form for Create and Edit: the slug key and its JSON value.
export default function SlugForm({ item, allItems, onDirtyChange, onCancel, onSaved }: SlugFormProps) {
  const t = useT();
  const isEdit = Boolean(item);
  const [initial] = useState<Draft>({ title: item?.title ?? '', slug: item?.slug ?? '', value: item?.value ?? '{\n  \n}' });
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const others = allItems.filter((s) => s.id !== item?.id);

  const dirty = draft.title !== initial.title || draft.slug !== initial.slug || draft.value !== initial.value;
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (submitted) setErrors(validate(next, others, t));
  };

  const parsed = parseJson(draft.value);
  const format = () => parsed.ok && update({ value: JSON.stringify(parsed.value, null, 2) });

  const scrollToFirstError = () => rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();

  const save = async () => {
    const next = validate(draft, others, t);
    setErrors(next);
    setSubmitted(true);
    setSaveError('');
    if (Object.keys(next).length) {
      requestAnimationFrame(scrollToFirstError);
      return;
    }
    setSaving(true);
    try {
      const saved = await slugApi.save({ id: item?.id, title: draft.title.trim(), slug: draft.slug.trim(), value: draft.value });
      onDirtyChange(false);
      onSaved(saved, !isEdit);
    } catch {
      setSaveError(t('Couldn’t save the slug. Check your connection and try again.'));
      setSaving(false);
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div ref={rootRef} className="flex-1 flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 pb-8 lg:pb-10">
        <div className={`${CONTENT_WIDTH} mx-auto`}>
          <h1 className="text-2xl sm:text-[28px] font-semibold leading-tight text-[#1A1A1A]">{isEdit ? t('Edit Slug') : t('Create Slug')}</h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">{t('Set the key the app looks up and the JSON value it gets back.')}</p>
          <button
            type="button"
            onClick={() => (dirty ? setConfirmDiscard(true) : onCancel())}
            className="mt-4 inline-flex items-center gap-1.5 h-8 -ml-1 px-1 text-sm text-[#6B7280] rounded-md hover:text-[#FF6115] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:arrow-left-linear" width={16} height={16} />
            {t('Back to {page}', { page: t('Slug Value') })}
          </button>

          {saveError && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
              <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
              {saveError}
            </p>
          )}

          <div className="mt-5">
            <EventFormSection id="slug-detail" icon="solar:hashtag-linear" title={t('Slug Value Detail')} description={t('What it’s for, the key, and the value the app reads.')}>
              <div className="space-y-5">
                <FormField label={t('Title')} required hint={t('What this slug is used for, so others know at a glance.')} error={errors.title}>
                  {(id) => (
                    <input
                      id={id}
                      value={draft.title}
                      onChange={(e) => update({ title: e.target.value })}
                      placeholder={t('e.g. {example}', { example: 'PIM event – community link' })}
                      maxLength={120}
                      aria-invalid={Boolean(errors.title) || undefined}
                      className={inputClass(Boolean(errors.title))}
                    />
                  )}
                </FormField>

                <FormField label={t('Slug')} required hint={t('Unique key used by the app, e.g. an event code.')} error={errors.slug}>
                  {(id) => (
                    <input
                      id={id}
                      value={draft.slug}
                      onChange={(e) => update({ slug: e.target.value })}
                      placeholder={t('e.g. {example}', { example: '0orj35al' })}
                      maxLength={100}
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={Boolean(errors.slug) || undefined}
                      className={`${inputClass(Boolean(errors.slug))} font-mono`}
                    />
                  )}
                </FormField>

                <FormField label={t('Value')} required hint={t('JSON object, array, string or number.')} error={errors.value}>
                  {(id) => (
                    <div>
                      <textarea
                        id={id}
                        value={draft.value}
                        onChange={(e) => update({ value: e.target.value })}
                        rows={12}
                        spellCheck={false}
                        aria-invalid={Boolean(errors.value) || undefined}
                        className={`${textareaClass(Boolean(errors.value))} font-mono text-[13px] leading-relaxed bg-[#F9FAFB] focus:bg-white`}
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        {draft.value.trim() &&
                          (parsed.ok ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-[#15803D]">
                              <Icon icon="solar:check-circle-linear" width={15} height={15} />
                              {t('Valid JSON')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-[#B45309]">
                              <Icon icon="solar:danger-circle-linear" width={15} height={15} />
                              {t('Not valid JSON yet')}
                            </span>
                          ))}
                        <button
                          type="button"
                          onClick={format}
                          disabled={!parsed.ok}
                          className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                        >
                          <Icon icon="solar:code-linear" width={15} height={15} />
                          {t('Format JSON')}
                        </button>
                      </div>
                    </div>
                  )}
                </FormField>
              </div>
            </EventFormSection>
          </div>
        </div>
      </div>

      <StickyActionBar
        maxWidth={CONTENT_WIDTH}
        note={
          errorCount > 0 ? (
            <button type="button" onClick={scrollToFirstError} className="inline-flex items-center gap-1.5 text-[#DC2626] font-medium hover:underline underline-offset-2">
              <Icon icon="solar:danger-circle-linear" width={16} height={16} className="flex-shrink-0" />
              {errorCount === 1 ? t('1 field needs attention') : t('{count} fields need attention', { count: errorCount })}
            </button>
          ) : (
            <span>
              {t('Required fields are marked with an asterisk')} (<span className="text-[#DC2626]">*</span>).
            </span>
          )
        }
        tertiary={{ label: t('Cancel'), onClick: () => (dirty ? setConfirmDiscard(true) : onCancel()), disabled: saving }}
        primary={{ label: saving ? t('Saving…') : isEdit ? t('Save Changes') : t('Save Slug'), onClick: save, disabled: saving }}
      />

      {confirmDiscard && (
        <DeleteConfirmationModal
          title={t('Discard changes?')}
          confirmLabel={t('Discard')}
          message={t('Your unsaved changes to this slug will be lost.')}
          onConfirm={() => {
            onDirtyChange(false);
            onCancel();
          }}
          onClose={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  );
}
