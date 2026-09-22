import { useState } from 'react';
import { events } from '../data/mock';

interface SurveyFeedbackProps {
  inEvent?: boolean;
}

const surveyQuestions = [
  { question: 'Overall event satisfaction', responses: [5, 12, 24, 45, 16], avg: 4.3 },
  { question: 'Event organization & management', responses: [3, 8, 18, 52, 21], avg: 4.5 },
  { question: 'Venue and facilities', responses: [2, 10, 30, 40, 20], avg: 4.4 },
  { question: 'Photo quality and delivery', responses: [1, 4, 15, 48, 34], avg: 4.7 },
];

const openFeedback = [
  { name: 'Suchada T.', rating: 5, text: 'Amazing event! The photo delivery was super fast and the quality was excellent. Will definitely join the next one.' },
  { name: 'Kittipong M.', rating: 4, text: 'Great experience overall. Venue was a bit crowded during peak hours but staff handled it well.' },
  { name: 'Warunya S.', rating: 4, text: 'Loved the PEEP SHARE app integration for instant photo access. Would love more photo-taking spots.' },
  { name: 'Pichaporn R.', rating: 5, text: 'Best event I\'ve attended this year. Highly recommended to everyone!' },
];

export default function SurveyFeedback({ inEvent }: SurveyFeedbackProps) {
  const [eventFilter, setEventFilter] = useState('1');

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      {!inEvent && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Survey & Feedback</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">Analyze attendee satisfaction and survey responses</p>
          </div>
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
          >
            {events.map(e => <option key={e.id} value={e.id.toString()}>{e.name}</option>)}
          </select>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Responses', value: '1,102', color: 'text-[#1A1A1A]' },
          { label: 'Response Rate', value: '88%', color: 'text-green-600' },
          { label: 'Avg. Satisfaction', value: '4.5 / 5', color: 'text-[#FF6115]' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Question Analytics */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Question Analytics</h3>
          <div className="space-y-5">
            {surveyQuestions.map((q, qi) => {
              const total = q.responses.reduce((a, b) => a + b, 0);
              return (
                <div key={qi}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#4B5563]">{q.question}</span>
                    <span className="text-sm font-semibold text-[#FF6115]">{q.avg.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-0.5 h-5 rounded overflow-hidden">
                    {q.responses.map((count, i) => {
                      const pct = (count / total) * 100;
                      const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];
                      return (
                        <div
                          key={i}
                          className={`${colors[i]} h-full transition-all`}
                          style={{ width: `${pct}%` }}
                          title={`${i + 1} star: ${count}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-[#9CA3AF]">
                    <span>1★</span><span>2★</span><span>3★</span><span>4★</span><span>5★</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Open-ended Feedback */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Open-ended Feedback</h3>
          <div className="space-y-3">
            {openFeedback.map((f, i) => (
              <div key={i} className="border border-[#E5E7EB] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#1A1A1A]">{f.name}</span>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= f.rating ? '#FF6115' : '#E5E7EB'} stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full py-2 text-sm text-[#FF6115] border border-[#FF6115]/30 rounded-lg hover:bg-[#FFF0E8] transition-colors">
            View All Responses
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium rounded-lg transition-colors">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export Data
        </button>
      </div>
    </div>
  );
}
