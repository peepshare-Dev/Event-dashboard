import { Icon } from '@iconify/react';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import { formatEventDateTime, type SetEventStatus } from '../../data/setEvents';

interface EventPreviewModalProps {
  name: string;
  category: string;
  status: SetEventStatus;
  bannerUrl?: string;
  descriptionHtml: string;
  startTime: string;
  endTime: string;
  onClose: () => void;
}

// How attendees will roughly see the event page.
export default function EventPreviewModal({
  name,
  category,
  status,
  bannerUrl,
  descriptionHtml,
  startTime,
  endTime,
  onClose,
}: EventPreviewModalProps) {
  return (
    <Modal title="Preview" onClose={onClose} maxWidth="sm:max-w-2xl">
      <div className="space-y-4">
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="w-full max-h-72 object-cover rounded-xl" />
        ) : (
          <div className="h-40 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">
            <Icon icon="solar:gallery-wide-linear" width={36} height={36} />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} shape="pill" />
          {category && <span className="text-xs text-[#6B7280] bg-[#F3F4F6] rounded-full px-2.5 py-1">{category}</span>}
        </div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">{name || 'Untitled'}</h2>
        <p className="flex items-center gap-2 text-sm text-[#4B5563]">
          <Icon icon="solar:calendar-linear" width={16} height={16} className="text-[#9CA3AF]" />
          {startTime ? `${formatEventDateTime(startTime)} – ${formatEventDateTime(endTime)}` : 'Date not set'}
        </p>
        {descriptionHtml ? (
          // Content comes from this admin's own editor session.
          <div className="rich-text text-sm text-[#1A1A1A]" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        ) : (
          <p className="text-sm text-[#9CA3AF]">No description yet.</p>
        )}
      </div>
    </Modal>
  );
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type PreviewData = Omit<EventPreviewModalProps, 'onClose'>;

// Opens a standalone preview page in a new tab (a blob URL, so it shares this origin and the
// banner's object URL keeps working).
export function openEventPreviewTab({ name, category, status, bannerUrl, descriptionHtml, startTime, endTime }: PreviewData) {
  const title = escapeHtml(name || 'Untitled');
  const when = startTime ? `${formatEventDateTime(startTime)} – ${formatEventDateTime(endTime)}` : 'Date not set';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Preview</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
<style>
  body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #F5F7FA; color: #1A1A1A; }
  .bar { background: #FFF0E8; color: #E5540F; font-size: 13px; text-align: center; padding: 8px 16px; }
  main { max-width: 760px; margin: 32px auto; background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; }
  .banner { width: 100%; max-height: 360px; object-fit: cover; display: block; }
  .placeholder { height: 200px; background: #F3F4F6; }
  .body { padding: 24px 28px 32px; }
  .chips span { display: inline-block; font-size: 12px; background: #F3F4F6; color: #4B5563; border-radius: 999px; padding: 4px 10px; margin-right: 6px; }
  h1 { font-size: 26px; font-weight: 600; margin: 14px 0 6px; }
  .when { color: #4B5563; font-size: 14px; margin-bottom: 20px; }
  .desc { font-size: 15px; line-height: 1.6; }
  .desc ul { list-style: disc; padding-left: 1.5rem; } .desc ol { padding-left: 1.5rem; }
  .desc a { color: #FF6115; } .desc img, .desc video { max-width: 100%; border-radius: 8px; }
  .desc blockquote { border-left: 3px solid #E5E7EB; margin: 0; padding-left: 12px; color: #6B7280; }
  @media (max-width: 640px) { main { margin: 0; border-radius: 0; border: 0; } .body { padding: 20px 16px; } }
</style></head>
<body>
  <div class="bar">Preview — this is how the event page will look. Not visible to attendees yet.</div>
  <main>
    ${bannerUrl ? `<img class="banner" src="${escapeHtml(bannerUrl)}" alt="">` : '<div class="placeholder"></div>'}
    <div class="body">
      <div class="chips"><span>${escapeHtml(status)}</span>${category ? `<span>${escapeHtml(category)}</span>` : ''}</div>
      <h1>${title}</h1>
      <div class="when">${escapeHtml(when)}</div>
      <div class="desc">${descriptionHtml || '<p style="color:#9CA3AF">No description yet.</p>'}</div>
    </div>
  </main>
</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
