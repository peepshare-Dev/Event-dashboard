import EventFormSection from '../../../components/set-event/form/EventFormSection';
import FormField from '../../../components/set-event/form/FormField';
import DateTimeRange, { DateTimeInput } from '../../../components/set-event/form/DateTimeRange';
import type { SectionProps } from './formModel';

export default function ScheduleSection({ form, patch, errors }: SectionProps) {
  return (
    <EventFormSection id="section-schedule" icon="solar:calendar-linear" title="Schedule" description="Set when registration opens and when your event takes place.">
      <div className="divide-y divide-[#F0F0F0]">
        <div className="pb-6">
          <FormField icon="solar:calendar-mark-linear" label="Event Date & Time" required error={errors.eventStart ?? errors.eventEnd} asGroup>
            {() => (
              <DateTimeRange
                start={{ date: form.eventStartDate, time: form.eventStartTime }}
                end={{ date: form.eventEndDate, time: form.eventEndTime }}
                onStartChange={(p) =>
                  patch({
                    eventStartDate: p.date ?? form.eventStartDate,
                    eventStartTime: p.time ?? form.eventStartTime,
                    // Most events end the same day: pre-fill the end date once.
                    eventEndDate: p.date && !form.eventEndDate ? p.date : form.eventEndDate,
                  })
                }
                onEndChange={(p) => patch({ eventEndDate: p.date ?? form.eventEndDate, eventEndTime: p.time ?? form.eventEndTime })}
                startInvalid={Boolean(errors.eventStart)}
                endInvalid={Boolean(errors.eventEnd)}
              />
            )}
          </FormField>
        </div>

        <div className="py-6">
          <FormField icon="solar:clipboard-list-linear" label="Registration Period" error={errors.regPeriod} asGroup>
            {() => (
              <DateTimeRange
                start={{ date: form.regOpenDate, time: form.regOpenTime }}
                end={{ date: form.regCloseDate, time: form.regCloseTime }}
                onStartChange={(p) => patch({ regOpenDate: p.date ?? form.regOpenDate, regOpenTime: p.time ?? form.regOpenTime })}
                onEndChange={(p) => patch({ regCloseDate: p.date ?? form.regCloseDate, regCloseTime: p.time ?? form.regCloseTime })}
                endInvalid={Boolean(errors.regPeriod)}
                max={form.eventEndDate}
              />
            )}
          </FormField>
        </div>

        <div className="pt-6">
          <FormField icon="solar:qr-code-linear" label="QR Code Expiry" hint="Event QR codes stop working after this time." asGroup>
            {() => (
              <DateTimeInput
                value={{ date: form.qrDate, time: form.qrTime }}
                onChange={(p) => patch({ qrDate: p.date ?? form.qrDate, qrTime: p.time ?? form.qrTime })}
                className="md:w-1/2 md:pr-[21px]"
              />
            )}
          </FormField>
        </div>
      </div>
    </EventFormSection>
  );
}
