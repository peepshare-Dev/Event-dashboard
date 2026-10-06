import EventFormSection from '../../../components/set-event/form/EventFormSection';
import FormField from '../../../components/set-event/form/FormField';
import ChoiceCards from '../../../components/set-event/form/ChoiceCards';
import SegmentedControl from '../../../components/set-event/form/SegmentedControl';
import Toggle from '../../../components/ui/Toggle';
import { PAYMENT_METHODS, REGISTRATION_TYPE_LABELS, type RegistrationType } from '../../../data/setEvents';
import type { SectionProps } from './formModel';

const TYPE_OPTIONS: { value: RegistrationType; label: string; description: string; icon: string }[] = [
  { value: 'Free', label: REGISTRATION_TYPE_LABELS.Free, description: 'Anyone can register at no cost.', icon: 'solar:ticket-linear' },
  { value: 'Paid', label: REGISTRATION_TYPE_LABELS.Paid, description: 'Attendees pay a fee to register.', icon: 'solar:wallet-money-linear' },
];

export default function RegistrationSection({ form, patch, errors }: SectionProps) {
  const type = form.registrationType;
  return (
    <EventFormSection id="section-registration" icon="solar:user-check-linear" title="Registration" description="Configure how attendees can join your event.">
      <div className="space-y-6">
        <FormField label="Registration Type" required error={errors.registrationType} asGroup>
          {() => (
            <ChoiceCards
              label="Registration Type"
              value={type}
              options={TYPE_OPTIONS}
              onChange={(registrationType) => patch({ registrationType })}
              invalid={Boolean(errors.registrationType)}
            />
          )}
        </FormField>

        {type && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 pt-6 border-t border-[#F0F0F0]">
            {type === 'Paid' && <PaidFields form={form} patch={patch} errors={errors} />}
            <CapacityField form={form} patch={patch} errors={errors} />
          </div>
        )}

        <div className="pt-6 border-t border-[#F0F0F0]">
          <FormField label="Allow join" hint="Turn off to pause new registrations without unpublishing the event." asGroup>
            {() => <Toggle checked={form.allowJoin} onChange={(allowJoin) => patch({ allowJoin })} label={form.allowJoin ? 'Active join' : 'Closed'} />}
          </FormField>
        </div>
      </div>
    </EventFormSection>
  );
}

function CapacityField({ form, patch, errors }: SectionProps) {
  return (
    <FormField label="Capacity" error={errors.maxParticipants} className="md:col-span-2" asGroup>
      {() => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <SegmentedControl
            label="Capacity"
            value={form.capacityLimited ? 'limited' : 'unlimited'}
            options={[
              { value: 'unlimited', label: 'Unlimited' },
              { value: 'limited', label: 'Limited' },
            ]}
            onChange={(v) => patch({ capacityLimited: v === 'limited' })}
          />
          {form.capacityLimited && (
            <NumberInput
              label="Maximum Participants"
              value={form.maxParticipants}
              onChange={(maxParticipants) => patch({ maxParticipants })}
              suffix="people"
              invalid={Boolean(errors.maxParticipants)}
              className="sm:w-64"
            />
          )}
        </div>
      )}
    </FormField>
  );
}

function PaidFields({ form, patch, errors }: SectionProps) {
  return (
    <>
      <FormField label="Registration Fee" required error={errors.ticketPrice}>
        {(id) => (
          <div
            className={`flex h-12 bg-white border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#FF6115]/30 focus-within:border-[#FF6115] ${
              errors.ticketPrice ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
            }`}
          >
            <span className="px-3 flex items-center text-sm font-medium text-[#6B7280] bg-[#F9FAFB] border-r border-[#E5E7EB]">THB</span>
            <input
              id={id}
              inputMode="decimal"
              value={form.ticketPrice}
              onChange={(e) => patch({ ticketPrice: e.target.value })}
              placeholder="0.00"
              aria-invalid={Boolean(errors.ticketPrice) || undefined}
              className="flex-1 min-w-0 px-3 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-transparent focus:outline-none"
            />
          </div>
        )}
      </FormField>

      <FormField label="Payment Methods" required error={errors.paymentMethods} className="md:col-span-2" asGroup>
        {() => (
          <div className="flex flex-wrap gap-2" data-invalid={Boolean(errors.paymentMethods) || undefined}>
            {PAYMENT_METHODS.map((method) => {
              const checked = form.paymentMethods.includes(method);
              return (
                <label
                  key={method}
                  className={`inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border text-sm cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#FF6115]/40 ${
                    checked ? 'border-[#FF6115] bg-[#FFF5EF] text-[#E5540F] font-medium' : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      patch({ paymentMethods: checked ? form.paymentMethods.filter((m) => m !== method) : [...form.paymentMethods, method] })
                    }
                    className="w-4 h-4 accent-[#FF6115]"
                  />
                  {method}
                </label>
              );
            })}
          </div>
        )}
      </FormField>
    </>
  );
}

function NumberInput({ label, value, onChange, suffix, invalid, className = '' }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex h-12 bg-white border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#FF6115]/30 focus-within:border-[#FF6115] ${
        invalid ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
      } ${className}`}
    >
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
        placeholder="e.g. 500"
        aria-label={label}
        aria-invalid={invalid || undefined}
        className="flex-1 min-w-0 px-3 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-transparent focus:outline-none"
      />
      <span className="px-3 flex items-center text-sm text-[#6B7280] bg-[#F9FAFB] border-l border-[#E5E7EB]">{suffix}</span>
    </div>
  );
}
