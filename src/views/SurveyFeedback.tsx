import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useT } from '@/i18n';
import { events, surveyForms, type SurveyForm, type SurveyQuestion, type SurveySubmission } from '../data/mock';

interface SurveyFeedbackProps {
  inEvent?: boolean;
  eventId?: number;
}

export default function SurveyFeedback({ inEvent, eventId }: SurveyFeedbackProps) {
  const t = useT();
  const [selectedEventId, setSelectedEventId] = useState(eventId ?? events[0]?.id ?? 1);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  const currentEventId = inEvent ? eventId ?? selectedEventId : selectedEventId;
  const forms = surveyForms.filter(f => f.eventId === currentEventId);
  const activeForm = forms.find(f => f.id === selectedFormId) ?? null;

  if (activeForm) {
    return <SurveyFormDetail form={activeForm} onBack={() => setSelectedFormId(null)} />;
  }

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      {!inEvent && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">{t('Survey & Feedback')}</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">{t('Analyze attendee satisfaction and survey responses')}</p>
          </div>
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
          >
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      )}

      {forms.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] py-16 text-center">
          <div className="flex flex-col items-center gap-2">
            <Icon icon="solar:clipboard-list-linear" width={32} height={32} color="#D1D5DB" />
            <p className="text-sm font-medium text-[#1A1A1A] mt-2">{t('No surveys yet')}</p>
            <p className="text-xs text-[#9CA3AF]">{t("This event doesn't have any survey forms.")}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(form => {
            const ratingQ = form.questions.find(q => q.type === 'rating');
            const avg = ratingQ ? average(form.submissions.map(s => Number(s.answers[ratingQ.id]) || 0)) : null;
            return (
              <button
                key={form.id}
                onClick={() => setSelectedFormId(form.id)}
                className="w-full text-left bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5 hover:border-[#FF6115]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">{t('Form #{id}', { id: form.id })}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${form.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {form.status === 'Active' ? t('Enabled') : t('Disabled')}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1A1A1A] mt-1.5">{form.title}</h3>
                  </div>
                  <Icon icon="solar:alt-arrow-right-linear" width={16} height={16} color="#9CA3AF" className="flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-[#4B5563] flex-wrap">
                  <span>{t('{count} respondents', { count: form.submissions.length })}</span>
                  <span>{t('{count} questions', { count: form.questions.length })}</span>
                  {avg !== null && form.submissions.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[#FF6115] font-medium">
                      <Icon icon="solar:star-bold" width={13} height={13} color="#FF6115" />
                      {avg.toFixed(1)} / 5
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function average(nums: number[]): number {
  const filtered = nums.filter(n => n > 0);
  if (filtered.length === 0) return 0;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

function SurveyFormDetail({ form, onBack }: { form: SurveyForm; onBack: () => void }) {
  const t = useT();
  const [tab, setTab] = useState<'submissions' | 'overview'>('submissions');

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <button onClick={onBack} className="hover:text-[#FF6115] transition-colors">{t('Survey & Feedback')}</button>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium truncate">{t('Form #{id}', { id: form.id })}</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5">
        <span className="inline-flex text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-1 rounded-full">{t('Form #{id}', { id: form.id })}</span>
        <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mt-2">{form.title}</h2>
        <p className="text-sm text-[#6B7280] mt-1">{form.description}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
          <div className="text-2xl font-bold text-[#1A1A1A]">{form.submissions.length}</div>
          <div className="text-xs text-[#9CA3AF] mt-0.5">{t('Total respondents')}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
          <div className="text-2xl font-bold text-[#1A1A1A]">{form.questions.length}</div>
          <div className="text-xs text-[#9CA3AF] mt-0.5">{t('Number of questions')}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
          <div className={`inline-flex items-center gap-1 text-sm font-semibold ${form.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
            {form.status === 'Active' ? (
              <Icon icon="solar:check-linear" width={14} height={14} />
            ) : (
              <Icon icon="solar:close-linear" width={14} height={14} />
            )}
            {form.status === 'Active' ? t('Enabled') : t('Disabled')}
          </div>
          <div className="text-xs text-[#9CA3AF] mt-0.5">{t('Form status')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTab('submissions')}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${tab === 'submissions' ? 'bg-[#FF6115] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6115]/40'}`}
        >
          {t('Submissions')}
        </button>
        <button
          onClick={() => setTab('overview')}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${tab === 'overview' ? 'bg-[#FF6115] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6115]/40'}`}
        >
          {t('Overview Statistics')}
        </button>
      </div>

      {tab === 'submissions' ? <SubmissionsTable form={form} /> : <OverviewStatistics form={form} />}
    </div>
  );
}

/** Downloads every submission as CSV (UTF-8 with BOM so Excel shows Thai) or as an Excel sheet. */
function exportSurvey(form: SurveyForm, format: 'csv' | 'excel', t: ReturnType<typeof useT>) {
  const header = ['#', t('IP Address'), t('Peepshare ID'), ...form.questions.map((q) => q.label), t('Submitted at')];
  const rows = form.submissions.map((s, i) => [i + 1, s.ip, s.peepshareId, ...form.questions.map((q) => s.answers[q.id] ?? ''), s.submittedAt]);
  let content: string;
  let type: string;
  if (format === 'csv') {
    const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    content = '\uFEFF' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
    type = 'text/csv;charset=utf-8';
  } else {
    // An HTML table saved as .xls opens as a sheet in Excel, no library needed.
    const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tr = (cells: unknown[], tag: 'th' | 'td') => `<tr>${cells.map((c) => `<${tag}>${esc(c)}</${tag}>`).join('')}</tr>`;
    content = `<html><head><meta charset="utf-8"></head><body><table>${tr(header, 'th')}${rows.map((r) => tr(r, 'td')).join('')}</table></body></html>`;
    type = 'application/vnd.ms-excel;charset=utf-8';
  }
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `survey-${form.id}-responses.${format === 'csv' ? 'csv' : 'xls'}`;
  a.click();
  URL.revokeObjectURL(url);
}

function SubmissionsTable({ form }: { form: SurveyForm }) {
  const t = useT();
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">{t('All respondents and answers')}</h3>
        <div className="flex items-center gap-2">
          {(['csv', 'excel'] as const).map((format) => (
            <button
              key={format}
              onClick={() => exportSurvey(form, format, t)}
              disabled={form.submissions.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon icon="solar:download-linear" width={13} height={13} />
              {format === 'csv' ? 'CSV' : 'Excel'}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide w-10">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{t('IP Address')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{t('Peepshare ID')}</th>
              {form.questions.map(q => (
                <th key={q.id} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide min-w-[200px] max-w-[260px]">{q.label}</th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{t('Submitted at')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {form.submissions.length === 0 ? (
              <tr>
                <td colSpan={form.questions.length + 4} className="text-center py-12 text-[#9CA3AF] text-sm">{t('No responses yet')}</td>
              </tr>
            ) : form.submissions.map((s, i) => (
              <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3.5 text-sm text-[#9CA3AF]">{i + 1}</td>
                <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{s.ip}</td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-mono text-[#4B5563] bg-[#F3F4F6] px-2 py-1 rounded-md whitespace-nowrap">{s.peepshareId}</span>
                </td>
                {form.questions.map(q => (
                  <td key={q.id} className="px-4 py-3.5 text-sm text-[#4B5563] min-w-[200px] max-w-[260px]">
                    {q.type === 'rating' ? (
                      <StarCell value={Number(s.answers[q.id]) || 0} />
                    ) : (
                      <span className="line-clamp-2" title={String(s.answers[q.id] ?? '')}>{String(s.answers[q.id] ?? '—')}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3.5 text-xs text-[#9CA3AF] whitespace-nowrap">{s.submittedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">{t('Total: {count} entries', { count: form.submissions.length })}</div>
    </div>
  );
}

function StarCell({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
      {[1, 2, 3, 4, 5].map(s => (
        <Icon
          key={s}
          icon={s <= value ? 'solar:star-bold' : 'solar:star-linear'}
          width={12}
          height={12}
          color={s <= value ? '#FF6115' : '#E5E7EB'}
        />
      ))}
      <span className="text-xs text-[#9CA3AF] ml-1">({value})</span>
    </span>
  );
}

function OverviewStatistics({ form }: { form: SurveyForm }) {
  const t = useT();
  if (form.submissions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] py-16 text-center text-sm text-[#9CA3AF]">
        {t('No responses to summarize yet')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {form.questions.map(q => (
        <div key={q.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">{q.label}</h4>
          {q.type === 'radio' && <RadioBreakdown question={q} submissions={form.submissions} />}
          {q.type === 'rating' && <RatingBreakdown question={q} submissions={form.submissions} />}
          {q.type === 'text' && <TextResponses question={q} submissions={form.submissions} />}
        </div>
      ))}
    </div>
  );
}

function RadioBreakdown({ question, submissions }: { question: SurveyQuestion; submissions: SurveySubmission[] }) {
  const options = question.options ?? [];
  const total = submissions.length;
  return (
    <div className="space-y-3">
      {options.map(opt => {
        const count = submissions.filter(s => s.answers[question.id] === opt).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={opt}>
            <div className="flex justify-between text-xs mb-1 gap-2">
              <span className="text-[#4B5563]">{opt}</span>
              <span className="font-medium text-[#1A1A1A] whitespace-nowrap">{count} ({pct}%)</span>
            </div>
            <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6115] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RatingBreakdown({ question, submissions }: { question: SurveyQuestion; submissions: SurveySubmission[] }) {
  const values = submissions.map(s => Number(s.answers[question.id]) || 0).filter(v => v > 0);
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const t = useT();

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl font-bold text-[#FF6115]">{avg.toFixed(1)}</span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Icon
              key={s}
              icon={s <= Math.round(avg) ? 'solar:star-bold' : 'solar:star-linear'}
              width={16}
              height={16}
              color={s <= Math.round(avg) ? '#FF6115' : '#E5E7EB'}
            />
          ))}
        </div>
        <span className="text-xs text-[#9CA3AF]">{t('from {count} responses', { count: values.length })}</span>
      </div>
      <div className="space-y-1.5">
        {[5, 4, 3, 2, 1].map(star => {
          const count = values.filter(v => v === star).length;
          const pct = values.length > 0 ? Math.round((count / values.length) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-[#9CA3AF] w-8 flex-shrink-0">{star}★</span>
              <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6115] rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-[#9CA3AF] w-8 flex-shrink-0 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TextResponses({ question, submissions }: { question: SurveyQuestion; submissions: SurveySubmission[] }) {
  const responses = submissions.filter(s => s.answers[question.id]);
  return (
    <div className="space-y-2.5 max-h-80 overflow-y-auto">
      {responses.map(s => (
        <div key={s.id} className="border border-[#E5E7EB] rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-[#9CA3AF]">{s.peepshareId}</span>
            <span className="text-[10px] text-[#9CA3AF]">{s.submittedAt}</span>
          </div>
          <p className="text-sm text-[#4B5563] leading-relaxed">{String(s.answers[question.id])}</p>
        </div>
      ))}
    </div>
  );
}
