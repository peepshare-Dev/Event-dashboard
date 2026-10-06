import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import StatusTabs from '../../components/ui/StatusTabs';
import Button from '../../components/ui/Button';
import Drawer from '../../components/ui/Drawer';
import Pagination from '../../components/ui/Pagination';
import Toggle from '../../components/ui/Toggle';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import SegmentedControl from '../../components/set-event/form/SegmentedControl';
import FormField from '../../components/set-event/form/FormField';
import { DateTimeInput } from '../../components/set-event/form/DateTimeRange';
import EventFormBuilder, { FIELD_TYPES } from '../../components/set-event/form/EventFormBuilder';
import { templatesToPresets } from '../../components/set-event/form/TemplatePicker';
import { formConfig, validateFields, type Errors } from './event-form/formModel';
import { CURRENT_AUTHOR, formatEventDateTime, type EventFormConfig, type EventFormField, type SetEvent, type SetEventDetails } from '../../data/setEvents';
import { cloneFields, newTemplateId, type FormKind, type FormTemplate } from '../../data/formTemplates';

export type { FormKind };

const PAGE_SIZE = 10;

const KIND = {
  registration: {
    title: 'Regis Form',
    icon: 'solar:document-add-linear',
    noun: 'registration form',
    section: 'Event Form',
  },
  survey: {
    title: 'Survey Form',
    icon: 'solar:chat-square-like-linear',
    noun: 'survey form',
    section: 'Survey Form',
  },
} as const;

const TABS = ['Templates', 'Used in Events'] as const;
type Tab = (typeof TABS)[number];

interface EventRow {
  event: SetEvent;
  form: EventFormConfig;
  /** Survey only */
  sendAt: string;
}

type Panel =
  | { type: 'template'; id: string | null; mode: 'view' | 'edit' }
  | { type: 'event'; eventId: number; mode: 'view' | 'edit' };

interface FormLibraryProps {
  kind: FormKind;
  events: SetEvent[];
  /** Every master template (both kinds). */
  templates: FormTemplate[];
  onTemplatesChange: (templates: FormTemplate[], message: string) => void;
  onUpdate: (eventId: number, patch: Partial<SetEventDetails>, message: string) => void;
  onOpenEvent: (event: SetEvent) => void;
}

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Regis / Survey Form menu: master templates (create, edit, duplicate, delete) and the forms events use.
export default function FormLibrary({ kind, events, templates, onTemplatesChange, onUpdate, onOpenEvent }: FormLibraryProps) {
  const meta = KIND[kind];
  const [tab, setTab] = useState<Tab>('Templates');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'off'>('all');
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [deleting, setDeleting] = useState<FormTemplate | null>(null);

  const ownTemplates = useMemo(() => templates.filter((t) => t.kind === kind), [templates, kind]);
  const eventRows = useMemo<EventRow[]>(
    () =>
      events.flatMap((event) => {
        const form = kind === 'registration' ? event.details?.eventForm : event.details?.surveyForm;
        if (event.status === 'Trash' || !form || (!form.name && form.fields.length === 0)) return [];
        return [{ event, form, sendAt: event.details?.surveySendTime ?? '' }];
      }),
    [events, kind],
  );
  const usage = (templateId: string) => eventRows.filter((r) => r.form.templateId === templateId);

  // --- Template actions ---
  const saveTemplate = (draft: FormTemplate) => {
    const exists = templates.some((t) => t.id === draft.id);
    const saved = { ...draft, updatedAt: nowLocal(), updatedBy: CURRENT_AUTHOR };
    onTemplatesChange(exists ? templates.map((t) => (t.id === saved.id ? saved : t)) : [...templates, saved], exists ? `“${saved.name}” saved` : `“${saved.name}” created`);
    setPanel({ type: 'template', id: saved.id, mode: 'view' });
  };
  const duplicateTemplate = (source: FormTemplate) => {
    const copy: FormTemplate = { ...source, id: newTemplateId(), name: `${source.name} (Copy)`, fields: cloneFields(source.fields), updatedAt: nowLocal(), updatedBy: CURRENT_AUTHOR };
    const index = templates.findIndex((t) => t.id === source.id);
    onTemplatesChange([...templates.slice(0, index + 1), copy, ...templates.slice(index + 1)], `“${copy.name}” created`);
    setTab('Templates');
    setPanel({ type: 'template', id: copy.id, mode: 'edit' });
  };
  const saveEventFormAsTemplate = (row: EventRow) => {
    const created: FormTemplate = {
      id: newTemplateId(),
      kind,
      name: row.form.name || 'Untitled template',
      description: row.form.description,
      fields: cloneFields(row.form.fields),
      updatedAt: nowLocal(),
      updatedBy: CURRENT_AUTHOR,
    };
    onTemplatesChange([...templates, created], `“${created.name}” saved as a template`);
    setTab('Templates');
    setPanel({ type: 'template', id: created.id, mode: 'view' });
  };

  // --- Lists ---
  const term = search.trim().toLowerCase();
  const visibleTemplates = ownTemplates.filter((t) => !term || `${t.name} ${t.description}`.toLowerCase().includes(term));
  const visibleRows = eventRows.filter(
    (r) => (status === 'all' || (status === 'active') === r.form.enabled) && (!term || `${r.form.name} ${r.event.name} ${r.event.id}`.toLowerCase().includes(term)),
  );
  const activeCount = eventRows.filter((r) => r.form.enabled).length;
  const total = tab === 'Templates' ? visibleTemplates.length : visibleRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = <T,>(list: T[]) => list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  const openTemplate = panel?.type === 'template' ? (panel.id ? ownTemplates.find((t) => t.id === panel.id) : undefined) : undefined;
  const openRow = panel?.type === 'event' ? eventRows.find((r) => r.event.id === panel.eventId) : undefined;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
        <PageHeader
          title={meta.title}
          icon={meta.icon}
          description={`Master ${meta.noun}s you can reuse as templates in any event.`}
          actions={
            <Button pill icon="solar:add-linear" onClick={() => setPanel({ type: 'template', id: null, mode: 'edit' })}>
              Create Template
            </Button>
          }
        />

        <StatusTabs
          tabs={TABS}
          active={tab}
          counts={{ Templates: ownTemplates.length, 'Used in Events': eventRows.length }}
          onChange={resetPage(setTab)}
          className="mt-6"
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={resetPage(setSearch)}
            placeholder={tab === 'Templates' ? 'Search templates' : 'Search form or event'}
            className="sm:max-w-xs"
          />
          {tab === 'Used in Events' && (
            <SegmentedControl
              label="Status"
              value={status}
              options={[
                { value: 'all', label: `All (${eventRows.length})` },
                { value: 'active', label: `Active (${activeCount})` },
                { value: 'off', label: `Off (${eventRows.length - activeCount})` },
              ]}
              onChange={resetPage(setStatus)}
            />
          )}
        </div>

        {tab === 'Templates' ? (
          visibleTemplates.length === 0 ? (
            <EmptyList
              icon={meta.icon}
              title={ownTemplates.length ? 'No templates match your search.' : `No ${meta.noun} templates yet`}
              text={ownTemplates.length ? undefined : `Create a template once and reuse it in the ${meta.section} of any event.`}
            />
          ) : (
            <>
              <div className="hidden md:block mt-4 overflow-x-auto border-b border-[#E5E7EB]">
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                      <th scope="col" className="h-11 pl-4 pr-5">Template</th>
                      <th scope="col" className="px-5">Fields</th>
                      <th scope="col" className="px-5">Used in</th>
                      <th scope="col" className="px-5">Last updated</th>
                      <th scope="col" className="w-44"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {pageSlice(visibleTemplates).map((t) => {
                      const used = usage(t.id).length;
                      return (
                        <tr key={t.id} className="h-[68px] hover:bg-[#FAFAFA] transition-colors">
                          <td className="pl-4 pr-5">
                            <button
                              type="button"
                              onClick={() => setPanel({ type: 'template', id: t.id, mode: 'view' })}
                              className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline"
                            >
                              {t.name}
                            </button>
                            {t.description && <p className="text-xs text-[#6B7280] truncate max-w-[320px]">{t.description}</p>}
                          </td>
                          <td className="px-5 text-[13px] text-[#374151] whitespace-nowrap">
                            {t.fields.length} <span className="text-[#9CA3AF]">· {t.fields.filter((f) => f.required).length} required</span>
                          </td>
                          <td className="px-5 text-[13px] whitespace-nowrap">
                            {used ? <span className="text-[#374151]">{used} {used === 1 ? 'event' : 'events'}</span> : <span className="text-[#9CA3AF]">Not used yet</span>}
                          </td>
                          <td className="px-5 text-[13px] text-[#374151] whitespace-nowrap">
                            {formatEventDateTime(t.updatedAt)} <span className="text-[#9CA3AF]">· {t.updatedBy}</span>
                          </td>
                          <td className="pr-3">
                            <TemplateActions
                              name={t.name}
                              onView={() => setPanel({ type: 'template', id: t.id, mode: 'view' })}
                              onEdit={() => setPanel({ type: 'template', id: t.id, mode: 'edit' })}
                              onDuplicate={() => duplicateTemplate(t)}
                              onDelete={() => setDeleting(t)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden mt-4 space-y-3">
                {pageSlice(visibleTemplates).map((t) => {
                  const used = usage(t.id).length;
                  return (
                    <li key={t.id} className="rounded-xl border border-[#E5E7EB] p-4">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{t.name}</p>
                      {t.description && <p className="text-xs text-[#6B7280] mt-0.5">{t.description}</p>}
                      <p className="mt-2 text-xs text-[#6B7280]">
                        {t.fields.length} {t.fields.length === 1 ? 'field' : 'fields'} · {used ? `Used in ${used} ${used === 1 ? 'event' : 'events'}` : 'Not used yet'}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Button variant="secondary" icon="solar:eye-linear" onClick={() => setPanel({ type: 'template', id: t.id, mode: 'view' })} className="h-11 flex-1">
                          View
                        </Button>
                        <TemplateActions
                          name={t.name}
                          onEdit={() => setPanel({ type: 'template', id: t.id, mode: 'edit' })}
                          onDuplicate={() => duplicateTemplate(t)}
                          onDelete={() => setDeleting(t)}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )
        ) : visibleRows.length === 0 ? (
          <EmptyList
            icon={meta.icon}
            title={eventRows.length ? 'No forms match your search.' : `No events use a ${meta.noun} yet`}
            text={eventRows.length ? undefined : `Forms turned on in ${meta.section} when creating or editing an event appear here.`}
          />
        ) : (
          <>
            <div className="hidden md:block mt-4 overflow-x-auto border-b border-[#E5E7EB]">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                    <th scope="col" className="h-11 pl-4 pr-5">Form</th>
                    <th scope="col" className="px-5">Event</th>
                    <th scope="col" className="px-5">Fields</th>
                    {kind === 'survey' && <th scope="col" className="px-5">Send time</th>}
                    <th scope="col" className="px-5">Status</th>
                    <th scope="col" className="w-24"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {pageSlice(visibleRows).map((r) => (
                    <tr key={r.event.id} className="h-[68px] hover:bg-[#FAFAFA] transition-colors">
                      <td className="pl-4 pr-5">
                        <button
                          type="button"
                          onClick={() => setPanel({ type: 'event', eventId: r.event.id, mode: 'view' })}
                          className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline"
                        >
                          {r.form.name || 'Untitled form'}
                        </button>
                        <TemplateSource templates={ownTemplates} templateId={r.form.templateId} />
                      </td>
                      <td className="px-5 text-[13px] text-[#374151]">
                        <span className="text-[#9CA3AF]">#{r.event.id}</span> {r.event.name || 'Untitled'}
                      </td>
                      <td className="px-5 text-[13px] text-[#374151] whitespace-nowrap">
                        {r.form.fields.length} <span className="text-[#9CA3AF]">· {r.form.fields.filter((f) => f.required).length} required</span>
                      </td>
                      {kind === 'survey' && <td className="px-5 text-[13px] text-[#374151] whitespace-nowrap">{formatEventDateTime(r.sendAt)}</td>}
                      <td className="px-5"><StatusPill enabled={r.form.enabled} /></td>
                      <td className="pr-3">
                        <div className="flex justify-end gap-1">
                          <RowAction icon="solar:eye-linear" label={`View ${r.form.name}`} onClick={() => setPanel({ type: 'event', eventId: r.event.id, mode: 'view' })} />
                          <RowAction icon="solar:pen-new-square-linear" label={`Edit ${r.form.name}`} onClick={() => setPanel({ type: 'event', eventId: r.event.id, mode: 'edit' })} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden mt-4 space-y-3">
              {pageSlice(visibleRows).map((r) => (
                <li key={r.event.id} className="rounded-xl border border-[#E5E7EB] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">{r.form.name || 'Untitled form'}</p>
                      <p className="text-xs text-[#6B7280] truncate">#{r.event.id} {r.event.name || 'Untitled'}</p>
                    </div>
                    <StatusPill enabled={r.form.enabled} />
                  </div>
                  <p className="mt-2 text-xs text-[#6B7280]">
                    {r.form.fields.length} {r.form.fields.length === 1 ? 'field' : 'fields'} · {r.form.fields.filter((f) => f.required).length} required
                    {kind === 'survey' && ` · ${formatEventDateTime(r.sendAt)}`}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="secondary" icon="solar:eye-linear" onClick={() => setPanel({ type: 'event', eventId: r.event.id, mode: 'view' })} className="h-11">View</Button>
                    <Button variant="secondary" icon="solar:pen-new-square-linear" onClick={() => setPanel({ type: 'event', eventId: r.event.id, mode: 'edit' })} className="h-11">Edit</Button>
                  </div>
                </li>
              ))}
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
          otherTemplates={ownTemplates.filter((t) => t.id !== panel.id)}
          onModeChange={(mode) => setPanel({ ...panel, mode })}
          onSave={saveTemplate}
          onDuplicate={() => openTemplate && duplicateTemplate(openTemplate)}
          onOpenEvent={onOpenEvent}
          onClose={() => setPanel(null)}
        />
      )}

      {panel?.type === 'event' && openRow && (
        <EventFormDrawer
          key={`${openRow.event.id}-${panel.mode}`}
          kind={kind}
          row={openRow}
          mode={panel.mode}
          templates={ownTemplates}
          onModeChange={(mode) => setPanel({ ...panel, mode })}
          onOpenEvent={() => onOpenEvent(openRow.event)}
          onSaveAsTemplate={() => saveEventFormAsTemplate(openRow)}
          onSave={(patch) => {
            onUpdate(openRow.event.id, patch, `“${(kind === 'registration' ? patch.eventForm : patch.surveyForm)?.name}” saved`);
            setPanel({ ...panel, mode: 'view' });
          }}
          onClose={() => setPanel(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmationModal
          title="Delete this template?"
          message={
            <>
              <span className="font-semibold text-[#1A1A1A]">{deleting.name}</span> will be removed from the master list. Events that already use it keep
              their own copy.
            </>
          }
          onConfirm={() => {
            onTemplatesChange(
              templates.filter((t) => t.id !== deleting.id),
              `“${deleting.name}” deleted`,
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
  const isSurvey = kind === 'survey';
  const creating = !template;
  const [draft, setDraft] = useState({ name: template?.name ?? '', description: template?.description ?? '', fields: template?.fields ?? [] });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (d: typeof draft) => {
    const e: Errors = {};
    if (!d.name.trim()) e.name = 'Enter a template name.';
    if (d.fields.length === 0) e.fields = 'Add at least one field.';
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
        title={template.name}
        description={`${KIND[kind].title} template`}
        onClose={onClose}
        maxWidth="sm:max-w-[720px]"
        footer={
          <>
            <Button variant="secondary" icon="solar:copy-linear" onClick={onDuplicate} className="h-11 sm:h-10">
              Duplicate
            </Button>
            <Button icon="solar:pen-new-square-linear" onClick={() => onModeChange('edit')} className="h-11 sm:h-10 sm:px-5">
              Edit Template
            </Button>
          </>
        }
      >
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Fields" value={String(template.fields.length)} />
            <Stat label="Required" value={String(template.fields.filter((f) => f.required).length)} />
            <Stat label="Used in" value={`${usedIn.length} ${usedIn.length === 1 ? 'event' : 'events'}`} />
            <Stat label="Last updated" value={template.updatedAt.slice(0, 10).split('-').reverse().join('-')} />
          </dl>
          {template.description && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Description</p>
              <p className="mt-1 text-sm text-[#374151] whitespace-pre-line">{template.description}</p>
            </div>
          )}
          <FieldList fields={template.fields} title={isSurvey ? 'Questions' : 'Fields'} />
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Used in events</p>
            {usedIn.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">
                Not used yet. Choose it with <span className="font-medium text-[#6B7280]">Use Template</span> in an event’s {KIND[kind].section}.
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
                      <span className="text-[#9CA3AF]">#{ev.id}</span> {ev.name || 'Untitled'}
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
      title={creating ? `Create ${KIND[kind].title} Template` : 'Edit Template'}
      description={
        creating
          ? 'Build it once, then reuse it in any event.'
          : usedIn.length
            ? `Changes apply to events that use it from now on. The ${usedIn.length} ${usedIn.length === 1 ? 'event' : 'events'} already using it keep their copy.`
            : 'Changes apply to events that use it from now on.'
      }
      onClose={onClose}
      maxWidth="sm:max-w-[720px]"
      footer={
        <>
          <Button variant="secondary" onClick={() => (creating ? onClose() : onModeChange('view'))} className="h-11 sm:h-10">
            Cancel
          </Button>
          <Button onClick={save} className="h-11 sm:h-10 sm:px-5">
            {creating ? 'Create Template' : 'Save Template'}
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

// --- Event form drawer: one event's copy ---

function EventFormDrawer({ kind, row, mode, templates, onModeChange, onOpenEvent, onSaveAsTemplate, onSave, onClose }: {
  kind: FormKind;
  row: EventRow;
  mode: 'view' | 'edit';
  templates: FormTemplate[];
  onModeChange: (mode: 'view' | 'edit') => void;
  onOpenEvent: () => void;
  onSaveAsTemplate: () => void;
  onSave: (patch: Partial<SetEventDetails>) => void;
  onClose: () => void;
}) {
  const isSurvey = kind === 'survey';
  const [draft, setDraft] = useState({ ...row.form, sendDate: row.sendAt.slice(0, 10), sendTime: row.sendAt.slice(11, 16) });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (d: typeof draft) => {
    const e: Errors = {};
    if (!d.name.trim()) e.name = 'Enter a form name.';
    if (d.fields.length === 0) e.fields = 'Add at least one field.';
    validateFields(d.fields, e);
    if (isSurvey && d.enabled && (!d.sendDate || !d.sendTime)) e.send = 'Set when the survey is sent.';
    return Object.fromEntries(Object.entries(e).filter(([, v]) => v));
  };
  const update = (patch: Partial<typeof draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (submitted) setErrors(validate(next));
  };
  const save = () => {
    const e = validate(draft);
    setErrors(e);
    setSubmitted(true);
    if (Object.keys(e).length) return;
    const form = formConfig(draft.enabled, draft.name, draft.description, draft.fields, draft.templateId);
    onSave(
      isSurvey
        ? { surveyForm: form, surveySendTime: draft.enabled && draft.sendDate && draft.sendTime ? `${draft.sendDate}T${draft.sendTime}` : '' }
        : { eventForm: form },
    );
  };

  const form = row.form;
  const source = templates.find((t) => t.id === form.templateId);

  return (
    <Drawer
      title={mode === 'edit' ? `Edit ${KIND[kind].title}` : form.name || 'Untitled form'}
      description={`#${row.event.id} ${row.event.name || 'Untitled'}`}
      onClose={onClose}
      maxWidth="sm:max-w-[720px]"
      footer={
        mode === 'view' ? (
          <>
            <Button variant="ghost" icon="solar:square-arrow-right-up-linear" onClick={onOpenEvent} className="h-11 sm:h-10 sm:mr-auto">
              Open Event
            </Button>
            <Button variant="secondary" icon="solar:copy-linear" onClick={onSaveAsTemplate} className="h-11 sm:h-10">
              Save as Template
            </Button>
            <Button icon="solar:pen-new-square-linear" onClick={() => onModeChange('edit')} className="h-11 sm:h-10 sm:px-5">
              Edit Form
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => onModeChange('view')} className="h-11 sm:h-10">
              Cancel
            </Button>
            <Button onClick={save} className="h-11 sm:h-10 sm:px-5">
              Save Changes
            </Button>
          </>
        )
      }
    >
      {mode === 'view' ? (
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Status" value={<StatusPill enabled={form.enabled} />} />
            <Stat label="Fields" value={String(form.fields.length)} />
            <Stat label="Required" value={String(form.fields.filter((f) => f.required).length)} />
            {isSurvey ? <Stat label="Send time" value={formatEventDateTime(row.sendAt)} /> : <Stat label="Template" value={source?.name ?? '—'} />}
          </dl>
          {isSurvey && source && (
            <p className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Icon icon="solar:copy-linear" width={16} height={16} />
              Based on template <span className="font-medium text-[#1A1A1A]">{source.name}</span>
            </p>
          )}
          {form.description && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Description</p>
              <p className="mt-1 text-sm text-[#374151] whitespace-pre-line">{form.description}</p>
            </div>
          )}
          <FieldList fields={form.fields} title={isSurvey ? 'Questions' : 'Fields'} />
        </div>
      ) : (
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">{isSurvey ? 'Send this survey' : 'Require this form'}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {isSurvey ? 'Turn off to stop sending it without losing the questions.' : 'Turn off to stop asking attendees without losing the fields.'}
              </p>
            </div>
            <Toggle checked={draft.enabled} onChange={(enabled) => update({ enabled })} label={draft.enabled ? 'Active' : 'Off'} />
          </div>

          {isSurvey && (
            <FormField label="Send Survey" required={draft.enabled} hint="Attendees receive the survey link at this time." error={errors.send} asGroup>
              {() => (
                <DateTimeInput
                  value={{ date: draft.sendDate, time: draft.sendTime }}
                  invalid={Boolean(errors.send)}
                  onChange={(p) => update({ sendDate: p.date ?? draft.sendDate, sendTime: p.time ?? draft.sendTime })}
                  className="sm:max-w-sm"
                />
              )}
            </FormField>
          )}

          <EventFormBuilder
            name={draft.name}
            description={draft.description}
            fields={draft.fields}
            onChange={(p) => update(p)}
            errors={errors}
            nameError={errors.name}
            fieldsError={errors.fields}
            presets={templatesToPresets(templates)}
            {...(isSurvey && {
              nameLabel: 'Survey Name',
              namePlaceholder: 'e.g. Post-event Feedback',
              descriptionLabel: 'Survey Description',
              fieldsLabel: 'Survey Questions',
              addLabel: 'Add Question',
            })}
          />
        </div>
      )}
    </Drawer>
  );
}

// --- Shared pieces ---

function FieldList({ fields, title }: { fields: EventFormField[]; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#1A1A1A] mb-3">{title}</p>
      {fields.length === 0 ? (
        <p className="text-sm text-[#9CA3AF]">No fields yet.</p>
      ) : (
        <ol className="space-y-2">
          {fields.map((f, i) => {
            const type = FIELD_TYPES.find((t) => t.value === f.type);
            return (
              <li key={f.id} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-[#F3F4F6] text-xs font-medium text-[#6B7280] flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-[#1A1A1A]">{f.label || 'Untitled field'}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${f.required ? 'bg-[#FEF2F2] text-[#B91C1C]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                      {f.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  {f.description && <p className="mt-0.5 text-xs text-[#6B7280]">{f.description}</p>}
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
                  {type?.label ?? f.type}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function TemplateSource({ templates, templateId }: { templates: FormTemplate[]; templateId?: string }) {
  const source = templates.find((t) => t.id === templateId);
  return source ? (
    <p className="flex items-center gap-1 text-xs text-[#6B7280] truncate max-w-[300px]">
      <Icon icon="solar:copy-linear" width={12} height={12} className="flex-shrink-0" />
      {source.name}
    </p>
  ) : null;
}

function TemplateActions({ name, onView, onEdit, onDuplicate, onDelete }: {
  name: string;
  onView?: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      {onView && <RowAction icon="solar:eye-linear" label={`View ${name}`} onClick={onView} />}
      <RowAction icon="solar:pen-new-square-linear" label={`Edit ${name}`} onClick={onEdit} />
      <RowAction icon="solar:copy-linear" label={`Duplicate ${name}`} onClick={onDuplicate} />
      <RowAction icon="solar:trash-bin-trash-linear" label={`Delete ${name}`} onClick={onDelete} destructive />
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

function StatusPill({ enabled }: { enabled: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${enabled ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-[#22C55E]' : 'border border-[#9CA3AF]'}`} aria-hidden="true" />
      {enabled ? 'Active' : 'Off'}
    </span>
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
