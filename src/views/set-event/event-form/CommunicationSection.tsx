import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import EventFormSection from '../../../components/set-event/form/EventFormSection';
import Button from '../../../components/ui/Button';
import Toggle from '../../../components/ui/Toggle';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import AutomationCard from '../../../components/set-event/automation/AutomationCard';
import AutomationEditor from '../../../components/set-event/automation/AutomationEditor';
import AutomationJourney from '../../../components/set-event/automation/AutomationJourney';
import { MESSAGE_VARIABLES, TRIGGERS, newAutomationId, type Automation } from '../../../data/automations';
import type { SectionProps } from './formModel';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const stageOrder = (a: Automation) => TRIGGERS.findIndex((t) => t.type === a.trigger.type);

// Communication: event-specific automations — WHEN something happens → WAIT → SEND a PEEP OA message.
export default function CommunicationSection({ form, patch }: SectionProps) {
  const [editing, setEditing] = useState<Automation | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Automation | null>(null);
  const { automations } = form;

  // Preview with this event's own details where they're filled in, sample values otherwise.
  const previewValues = useMemo(() => {
    const values = Object.fromEntries(MESSAGE_VARIABLES.map((v) => [v.key, v.sample]));
    if (form.name.trim()) values.event_name = form.name.trim();
    if (form.eventStartDate) {
      const [y, m, d] = form.eventStartDate.split('-');
      values.event_date = `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
    }
    if (form.eventStartTime) values.event_time = form.eventStartTime;
    const location = form.venueName.trim() || form.onlinePlatform;
    if (location) values.event_location = location;
    return values;
  }, [form.name, form.eventStartDate, form.eventStartTime, form.venueName, form.onlinePlatform]);

  // Shown in journey order (registration → check-in → after the event), then by when they were added.
  const sorted = useMemo(() => [...automations].sort((a, b) => stageOrder(a) - stageOrder(b)), [automations]);
  const activeCount = automations.filter((a) => a.enabled).length;

  const setAutomations = (next: Automation[]) => patch({ automations: next });
  const save = (saved: Automation) => {
    setAutomations(automations.some((a) => a.id === saved.id) ? automations.map((a) => (a.id === saved.id ? saved : a)) : [...automations, saved]);
    setEditing(null);
  };
  const duplicate = (source: Automation) => {
    const index = automations.findIndex((a) => a.id === source.id);
    const copy: Automation = { ...structuredClone(source), id: newAutomationId(), name: `${source.name} (Copy)` };
    setAutomations([...automations.slice(0, index + 1), copy, ...automations.slice(index + 1)]);
  };

  return (
    <EventFormSection
      id="section-communication"
      icon="solar:chat-round-dots-linear"
      title="Communication"
      description="Automatically send messages to attendees based on their event activity."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">Enable automated messages</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Send PEEP OA messages when attendees register, check in, or at a set time.</p>
          </div>
          <Toggle checked={form.communicationEnabled} onChange={(communicationEnabled) => patch({ communicationEnabled })} label={form.communicationEnabled ? 'On' : 'Off'} />
        </div>

        {!form.communicationEnabled ? (
          <EmptyState
            icon="solar:chat-round-dots-linear"
            title="Automated messages are turned off for this event."
            text="Enable this feature to send messages to attendees automatically."
            action={
              <Button variant="secondary" icon="solar:bolt-linear" onClick={() => patch({ communicationEnabled: true })}>
                Enable Communication
              </Button>
            }
          />
        ) : (
          <div className="pt-6 border-t border-[#F0F0F0] space-y-5">
            <AutomationJourney automations={automations} />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Broadcast Automations</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {automations.length === 0
                    ? 'Each automation: when this happens → wait → send this message.'
                    : `${automations.length} ${automations.length === 1 ? 'automation' : 'automations'} · ${activeCount} active`}
                </p>
              </div>
              {automations.length > 0 && (
                <Button icon="solar:add-linear" variant="secondary" onClick={() => setEditing('new')} className="sm:flex-shrink-0">
                  Add Broadcast
                </Button>
              )}
            </div>

            {automations.length === 0 ? (
              <EmptyState
                icon="solar:bolt-linear"
                title="No automated messages yet"
                text="Create an automation to automatically communicate with attendees after registration, check-in, or at a scheduled time."
                action={
                  <Button icon="solar:add-linear" onClick={() => setEditing('new')}>
                    Add Broadcast
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {sorted.map((a) => (
                  <AutomationCard
                    key={a.id}
                    automation={a}
                    onEdit={() => setEditing(a)}
                    onDuplicate={() => duplicate(a)}
                    onDelete={() => setDeleting(a)}
                    onToggle={(enabled) => setAutomations(automations.map((x) => (x.id === a.id ? { ...x, enabled } : x)))}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <AutomationEditor
          automation={editing === 'new' ? undefined : editing}
          previewValues={previewValues}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteConfirmationModal
          title="Delete this automation?"
          message="This automated message will no longer be sent to attendees."
          onConfirm={() => {
            setAutomations(automations.filter((a) => a.id !== deleting.id));
            setDeleting(null);
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </EventFormSection>
  );
}

function EmptyState({ icon, title, text, action }: { icon: string; title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-8 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB]">
      <span className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
        <Icon icon={icon} width={24} height={24} className="text-[#9CA3AF]" />
      </span>
      <p className="mt-3 text-sm font-semibold text-[#374151]">{title}</p>
      <p className="mt-1 max-w-md text-sm text-[#6B7280]">{text}</p>
      <div className="mt-4">{action}</div>
    </div>
  );
}
