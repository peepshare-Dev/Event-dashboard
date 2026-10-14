import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import Button from '../../components/ui/Button';
import Drawer from '../../components/ui/Drawer';
import Pagination from '../../components/ui/Pagination';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import EventFormBuilder, { RATING_STARS, fieldTypeOption, isQuestion } from '../../components/set-event/form/EventFormBuilder';
import { templatesToPresets } from '../../components/set-event/form/TemplatePicker';
import { formConfig, validateFields, type Errors } from './event-form/formModel';
import { CURRENT_AUTHOR, formatEventDateTime, type EventFormConfig, type EventFormField, type SetEvent } from '../../data/setEvents';
import { cloneFields, newTemplateId, type FormKind, type FormTemplate } from '../../data/formTemplates';
import { useT } from '@/i18n';

export type { FormKind };

const PAGE_SIZE = 10;

const KIND = {
  registration: {
    title: 'Regis Form',
    icon: 'solar:document-add-linear',
    noun: 'registration form',
    section: 'Event Form',
    // Full sentences per kind, so each can be translated as a whole.
    pageDescription: 'Master registration forms you can reuse as templates in any event.',
    emptyTitle: 'No registration form templates yet',
    emptyText: 'Create a template once and reuse it in the Event Form of any event.',
    viewDescription: 'Regis Form template',
    createTitle: 'Create Regis Form Template',
    notUsed: 'Not used yet. Choose it with {action} in an event’s Event Form.',
  },
  survey: {
    title: 'Survey Form',
    icon: 'solar:chat-square-like-linear',
    noun: 'survey form',
    section: 'Survey Form',
    pageDescription: 'Master survey forms you can reuse as templates in any event.',
    emptyTitle: 'No survey form templates yet',
    emptyText: 'Create a template once and reuse it in the Survey Form of any event.',
    viewDescription: 'Survey Form template',
    createTitle: 'Create Survey Form Template',
    notUsed: 'Not used yet. Choose it with {action} in an event’s Survey Form.',
  },
} as const;

interface EventRow {
  event: SetEvent;
  form: EventFormConfig;
}

type Panel = { type: 'template'; id: string | null; mode: 'view' | 'edit' };

interface FormLibraryProps {
  kind: FormKind;
  events: SetEvent[];
  /** Every master template (both kinds). */
  templates: FormTemplate[];
  onTemplatesChange: (templates: FormTemplate[], message: string) => void;
  onOpenEvent: (event: SetEvent) => void;
}

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Regis / Survey Form menu: master templates (create, edit, duplicate, delete).
export default function FormLibrary({ kind, events, templates, onTemplatesChange, onOpenEvent }: FormLibraryProps) {
  const t = useT();
  const meta = KIND[kind];
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [deleting, setDeleting] = useState<FormTemplate | null>(null);

  const ownTemplates = useMemo(() => templates.filter((t) => t.kind === kind), [templates, kind]);
  const eventRows = useMemo<EventRow[]>(
    () =>
      events.flatMap((event) => {
        const form = kind === 'registration' ? event.details?.eventForm : event.details?.surveyForm;
        if (event.status === 'Trash' || !form || (!form.name && form.fields.length === 0)) return [];
        return [{ event, form }];
      }),
    [events, kind],
  );
  const usage = (templateId: string) => eventRows.filter((r) => r.form.templateId === templateId);

  // --- Template actions ---
  const saveTemplate = (draft: FormTemplate) => {
    const exists = templates.some((tpl) => tpl.id === draft.id);
    const saved = { ...draft, updatedAt: nowLocal(), updatedBy: CURRENT_AUTHOR };
    onTemplatesChange(exists ? templates.map((tpl) => (tpl.id === saved.id ? saved : tpl)) : [...templates, saved], exists ? t('“{name}” saved', { name: saved.name }) : t('“{name}” created', { name: saved.name }));
    setPanel({ type: 'template', id: saved.id, mode: 'view' });
  };
  const duplicateTemplate = (source: FormTemplate) => {
    const copy: FormTemplate = { ...source, id: newTemplateId(), name: `${source.name} (Copy)`, fields: cloneFields(source.fields), updatedAt: nowLocal(), updatedBy: CURRENT_AUTHOR };
    const index = templates.findIndex((tpl) => tpl.id === source.id);
    onTemplatesChange([...templates.slice(0, index + 1), copy, ...templates.slice(index + 1)], t('“{name}” created', { name: copy.name }));
    setPanel({ type: 'template', id: copy.id, mode: 'edit' });
  };
  // --- Lists ---
  const term = search.trim().toLowerCase();
  const visibleTemplates = ownTemplates.filter((t) => !term || `${t.name} ${t.description}`.toLowerCase().includes(term));
  const total = visibleTemplates.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = <T,>(list: T[]) => list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  const openTemplate = panel?.type === 'template' ? (panel.id ? ownTemplates.find((t) => t.id === panel.id) : undefined) : undefined;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
        <PageHeader
          title={t(meta.title)}
          icon={meta.icon}
          description={t(meta.pageDescription)}
          actions={
            <Button pill icon="solar:add-linear" onClick={() => setPanel({ type: 'template', id: null, mode: 'edit' })}>
              {t('Create Template')}
            </Button>
          }
        />

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={resetPage(setSearch)}
            placeholder={t('Search templates')}
            className="sm:max-w-xs"
          />
        </div>

        {visibleTemplates.length === 0 ? (
            <EmptyList
              icon={meta.icon}
              title={ownTemplates.length ? t('No templates match your search.') : t(meta.emptyTitle)}
              text={ownTemplates.length ? undefined : t(meta.emptyText)}
            />
          ) : (
            <>
              <div className="hidden md:block mt-4 overflow-x-auto border-b border-[#E5E7EB]">
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                      <th scope="col" className="h-11 pl-4 pr-5">{t('Template')}</th>
                      <th scope="col" className="px-5">{t('Fields')}</th>
                      <th scope="col" className="px-5">{t('Used in')}</th>
                      <th scope="col" className="px-5">{t('Last updated')}</th>
                      <th scope="col" className="w-44"><span className="sr-only">{t('Actions')}</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {pageSlice(visibleTemplates).map((tpl) => {
                      const used = usage(tpl.id).length;
                      return (
                        <tr key={tpl.id} className="h-[68px] hover:bg-[#FAFAFA] transition-colors">
                          <td className="pl-4 pr-5">
                            <button
                              type="button"
                              onClick={() => setPanel({ type: 'template', id: tpl.id, mode: 'view' })}
                              className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline"
                            >
                              {t(tpl.name)}
                            </button>
                            {tpl.description && <p className="text-xs text-[#6B7280] truncate max-w-[320px]">{t(tpl.description)}</p>}
                          </td>
                          <td className="px-5 text-[13px] text-[#374151] whitespace-nowrap">
                            {tpl.fields.filter(isQuestion).length} <span className="text-[#9CA3AF]">· {t('{count} required', { count: tpl.fields.filter((f) => f.required).length })}</span>
                          </td>
                          <td className="px-5 text-[13px] whitespace-nowrap">
                            {used ? <span className="text-[#374151]">{t(used === 1 ? '{count} event' : '{count} events', { count: used })}</span> : <span className="text-[#9CA3AF]">{t('Not used yet')}</span>}
                          </td>
                          <td className="px-5 text-[13px] text-[#374151] whitespace-nowrap">
                            {formatEventDateTime(tpl.updatedAt)} <span className="text-[#9CA3AF]">· {tpl.updatedBy}</span>
                          </td>
                          <td className="pr-3">
                            <TemplateActions
                              name={t(tpl.name)}
                              onView={() => setPanel({ type: 'template', id: tpl.id, mode: 'view' })}
                              onEdit={() => setPanel({ type: 'template', id: tpl.id, mode: 'edit' })}
                              onDuplicate={() => duplicateTemplate(tpl)}
                              onDelete={() => setDeleting(tpl)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden mt-4 space-y-3">
                {pageSlice(visibleTemplates).map((tpl) => {
                  const used = usage(tpl.id).length;
                  const questions = tpl.fields.filter(isQuestion).length;
                  return (
                    <li key={tpl.id} className="rounded-xl border border-[#E5E7EB] p-4">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{t(tpl.name)}</p>
                      {tpl.description && <p className="text-xs text-[#6B7280] mt-0.5">{t(tpl.description)}</p>}
                      <p className="mt-2 text-xs text-[#6B7280]">
                        {t(questions === 1 ? '{count} field' : '{count} fields', { count: questions })} · {used ? t(used === 1 ? 'Used in {count} event' : 'Used in {count} events', { count: used }) : t('Not used yet')}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Button variant="secondary" icon="solar:eye-linear" onClick={() => setPanel({ type: 'template', id: tpl.id, mode: 'view' })} className="h-11 flex-1">
                          {t('View')}
                        </Button>
                        <TemplateActions
                          name={t(tpl.name)}
                          onEdit={() => setPanel({ type: 'template', id: tpl.id, mode: 'edit' })}
                          onDuplicate={() => duplicateTemplate(tpl)}
                          onDelete={() => setDeleting(tpl)}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

        {totalPages > 1 && (
          <div className="-mx-4 sm:-mx-6 -mb-6">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {panel?.type === 'template' && (panel.id === null || openTemplate) && (
        <TemplateDrawer
          key={`${panel.id}-${panel.mode}`}
          kind={kind}
          template={openTemplate}
          mode={panel.mode}
          usedIn={openTemplate ? usage(openTemplate.id).map((r) => r.event) : []}
          otherTemplates={ownTemplates.filter((tpl) => tpl.id !== panel.id)}
          onModeChange={(mode) => setPanel({ ...panel, mode })}
          onSave={saveTemplate}
          onDuplicate={() => openTemplate && duplicateTemplate(openTemplate)}
          onOpenEvent={onOpenEvent}
          onClose={() => setPanel(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmationModal
          title={t('Delete this template?')}
          message={
            <>
              <span className="font-semibold text-[#1A1A1A]">{t(deleting.name)}</span>{' '}
              {t('will be removed from the master list. Events that already use it keep their own copy.')}
            </>
          }
          onConfirm={() => {
            onTemplatesChange(
              templates.filter((tpl) => tpl.id !== deleting.id),
              t('“{name}” deleted', { name: deleting.name }),
            );
            if (panel?.type === 'template' && panel.id === deleting.id) setPanel(null);
            setDeleting(null);
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

// --- Template drawer: view / edit / create ---

function TemplateDrawer({ kind, template, mode, usedIn, otherTemplates, onModeChange, onSave, onDuplicate, onOpenEvent, onClose }: {
  kind: FormKind;
  /** Undefined while creating. */
  template?: FormTemplate;
  mode: 'view' | 'edit';
  usedIn: SetEvent[];
  otherTemplates: FormTemplate[];
  onModeChange: (mode: 'view' | 'edit') => void;
  onSave: (template: FormTemplate) => void;
  onDuplicate: () => void;
  onOpenEvent: (event: SetEvent) => void;
  onClose: () => void;
}) {
  const t = useT();
  const isSurvey = kind === 'survey';
  const creating = !template;
  const [draft, setDraft] = useState({ name: template?.name ?? '', description: template?.description ?? '', fields: template?.fields ?? [] });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (d: typeof draft) => {
    const e: Errors = {};
    if (!d.name.trim()) e.name = 'Enter a template name.';
    if (!d.fields.some(isQuestion)) e.fields = 'Add at least one field.';
    validateFields(d.fields, e);
    return Object.fromEntries(Object.entries(e).filter(([, v]) => v));
  };
  const update = (p: Partial<typeof draft>) => {
    const next = { ...draft, ...p };
    setDraft(next);
    if (submitted) setErrors(validate(next));
  };
  const save = () => {
    const e = validate(draft);
    setErrors(e);
    setSubmitted(true);
    if (Object.keys(e).length) return;
    const clean = formConfig(true, draft.name, draft.description, draft.fields);
    onSave({
      id: template?.id ?? newTemplateId(),
      kind,
      name: clean.name,
      description: clean.description,
      fields: clean.fields,
      updatedAt: template?.updatedAt ?? '',
      updatedBy: template?.updatedBy ?? '',
    });
  };

  if (mode === 'view' && template) {
    return (
      <Drawer
        title={t(template.name)}
        description={t(KIND[kind].viewDescription)}
        onClose={onClose}
        maxWidth="sm:max-w-[720px]"
        footer={
          <>
            <Button variant="secondary" icon="solar:copy-linear" onClick={onDuplicate} className="h-11 sm:h-10">
              {t('Duplicate')}
            </Button>
            <Button icon="solar:pen-new-square-linear" onClick={() => onModeChange('edit')} className="h-11 sm:h-10 sm:px-5">
              {t('Edit Template')}
            </Button>
          </>
        }
      >
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label={t('Fields')} value={String(template.fields.filter(isQuestion).length)} />
            <Stat label={t('Required')} value={String(template.fields.filter((f) => f.required).length)} />
            <Stat label={t('Used in')} value={t(usedIn.length === 1 ? '{count} event' : '{count} events', { count: usedIn.length })} />
            <Stat label={t('Last updated')} value={template.updatedAt.slice(0, 10).split('-').reverse().join('-')} />
          </dl>
          {template.description && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">{t('Description')}</p>
              <p className="mt-1 text-sm text-[#374151] whitespace-pre-line">{t(template.description)}</p>
            </div>
          )}
          <FieldList fields={template.fields} title={isSurvey ? t('Questions') : t('Fields')} />
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">{t('Used in events')}</p>
            {usedIn.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">
                {t(KIND[kind].notUsed).split('{action}')[0]}
                <span className="font-medium text-[#6B7280]">{t('Use Template')}</span>
                {t(KIND[kind].notUsed).split('{action}')[1]}
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {usedIn.map((ev) => (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => onOpenEvent(ev)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs text-[#374151] hover:border-[#FFB38F] hover:text-[#E5540F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                    >
                      <span className="text-[#9CA3AF]">#{ev.id}</span> {ev.name || t('Untitled')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      title={creating ? t(KIND[kind].createTitle) : t('Edit Template')}
      description={
        creating
          ? t('Build it once, then reuse it in any event.')
          : usedIn.length
            ? t(usedIn.length === 1 ? 'Changes apply to events that use it from now on. The {count} event already using it keeps its copy.' : 'Changes apply to events that use it from now on. The {count} events already using it keep their copy.', { count: usedIn.length })
            : t('Changes apply to events that use it from now on.')
      }
      onClose={onClose}
      maxWidth="sm:max-w-[720px]"
      footer={
        <>
          <Button variant="secondary" onClick={() => (creating ? onClose() : onModeChange('view'))} className="h-11 sm:h-10">
            {t('Cancel')}
          </Button>
          <Button onClick={save} className="h-11 sm:h-10 sm:px-5">
            {creating ? t('Create Template') : t('Save Template')}
          </Button>
        </>
      }
    >
      <div className="px-4 sm:px-6 py-6">
        <EventFormBuilder
          name={draft.name}
          description={draft.description}
          fields={draft.fields}
          onChange={({ name, description, fields }) =>
            update({ ...(name !== undefined && { name }), ...(description !== undefined && { description }), ...(fields !== undefined && { fields }) })
          }
          errors={errors}
          nameError={errors.name}
          fieldsError={errors.fields}
          presets={templatesToPresets(otherTemplates)}
          nameLabel="Template Name"
          namePlaceholder={isSurvey ? 'e.g. Post-event Feedback' : 'e.g. Standard Registration'}
          descriptionLabel="Template Description"
          descriptionPlaceholder="What this template is for, e.g. the kind of event that uses it."
          {...(isSurvey && { fieldsLabel: 'Survey Questions', addLabel: 'Add Question' })}
        />
      </div>
    </Drawer>
  );
}

// --- Shared pieces ---

function FieldList({ fields, title }: { fields: EventFormField[]; title: string }) {
  const t = useT();
  return (
    <div>
      <p className="text-sm font-semibold text-[#1A1A1A] mb-3">{title}</p>
      {fields.length === 0 ? (
        <p className="text-sm text-[#9CA3AF]">{t('No fields yet.')}</p>
      ) : (
        <ol className="space-y-2">
          {fields.map((f, i) => {
            const type = fieldTypeOption(f.type);
            // Questions are numbered 1, 2, 3… skipping section headings.
            const number = fields.slice(0, i + 1).filter(isQuestion).length;
            if (f.type === 'heading') {
              return (
                <li key={f.id} className="pt-2 first:pt-0">
                  <div className="flex items-start gap-3 rounded-xl border-l-4 border-[#FF6115] bg-[#FFFAF7] px-4 py-3">
                    <span className="mt-0.5 w-6 h-6 rounded-md bg-[#FF6115] text-white text-xs font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      H
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{f.label || t('Untitled section')}</p>
                      {f.description && <p className="mt-0.5 text-xs text-[#6B7280]">{f.description}</p>}
                    </div>
                  </div>
                </li>
              );
            }
            return (
              <li key={f.id} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-[#F3F4F6] text-xs font-medium text-[#6B7280] flex items-center justify-center flex-shrink-0">{number}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-[#1A1A1A]">{f.label || t('Untitled field')}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${f.required ? 'bg-[#FEF2F2] text-[#B91C1C]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                      {f.required ? t('Required') : t('Optional')}
                    </span>
                  </div>
                  {f.description && <p className="mt-0.5 text-xs text-[#6B7280]">{f.description}</p>}
                  {f.type === 'rating' && (
                    <div className="mt-2 flex gap-1" aria-label={t('{count}-star rating', { count: RATING_STARS })}>
                      {Array.from({ length: RATING_STARS }, (_, n) => (
                        <Icon key={n} icon="solar:star-linear" width={16} height={16} className="text-[#F59E0B]" />
                      ))}
                    </div>
                  )}
                  {f.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.options.map((o) => (
                        <span key={o} className="text-xs px-2 py-0.5 rounded-md border border-[#E5E7EB] text-[#374151]">{o}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] flex-shrink-0">
                  {type?.icon && <Icon icon={type.icon} width={14} height={14} />}
                  {type?.label ? t(type.label) : f.type}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function TemplateActions({ name, onView, onEdit, onDuplicate, onDelete }: {
  name: string;
  onView?: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  return (
    <div className="flex justify-end gap-1">
      {onView && <RowAction icon="solar:eye-linear" label={t('View {name}', { name })} onClick={onView} />}
      <RowAction icon="solar:pen-new-square-linear" label={t('Edit {name}', { name })} onClick={onEdit} />
      <RowAction icon="solar:copy-linear" label={t('Duplicate {name}', { name })} onClick={onDuplicate} />
      <RowAction icon="solar:trash-bin-trash-linear" label={t('Delete {name}', { name })} onClick={onDelete} destructive />
    </div>
  );
}

function EmptyList({ icon, title, text }: { icon: string; title: string; text?: string }) {
  return (
    <div className="mt-4 border border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
        <Icon icon={icon} width={22} height={22} className="text-[#FF6115]" />
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
      {text && <p className="text-sm text-[#6B7280] mt-1 max-w-sm">{text}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#F0F0F0] bg-[#F9FAFB] px-3.5 py-3 min-w-0">
      <dt className="text-xs text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#1A1A1A] truncate">{value}</dd>
    </div>
  );
}

function RowAction({ icon, label, destructive, onClick }: { icon: string; label: string; destructive?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        destructive ? 'text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2]' : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6]'
      }`}
    >
      <Icon icon={icon} width={18} height={18} />
    </button>
  );
}
