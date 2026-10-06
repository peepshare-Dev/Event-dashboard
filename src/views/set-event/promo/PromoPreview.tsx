import { Icon } from '@iconify/react';
import PromoStatusBadge from './PromoStatusBadge';
import type { Placement } from './placements';
import { CLICK_ACTIONS, describeClick, formatDay, showFrequencyLabel, type BannerDisplayStatus, type PromoItem } from '../../../data/appBanners';

/** Image in the placement's shape (wide banner or portrait cover page), or a placeholder. */
export function PromoThumbnail({ item, shape, className = '' }: { item: Pick<PromoItem, 'image' | 'name'>; shape: Placement['shape']; className?: string }) {
  const aspect = shape === 'banner' ? 'aspect-[1432/480]' : 'aspect-[3/4]';
  return item.image ? (
    <img src={item.image.url} alt={`${item.name || 'Untitled'} image`} className={`block ${aspect} object-cover rounded-lg bg-[#F3F4F6] ${className}`} />
  ) : (
    <div className={`${aspect} rounded-lg bg-[#F3F4F6] border border-dashed border-[#D1D5DB] flex items-center justify-center ${className}`}>
      <Icon icon={shape === 'banner' ? 'solar:gallery-wide-linear' : 'solar:smartphone-2-linear'} width={20} height={20} className="text-[#9CA3AF]" />
    </div>
  );
}

interface PromoPreviewProps {
  placement: Placement;
  item: PromoItem;
  position: number;
  shownAs: BannerDisplayStatus;
}

// Contextual preview: a banner in the app's home carousel, or a cover page popup over the app.
export default function PromoPreview({ placement, item, position, shownAs }: PromoPreviewProps) {
  const action = CLICK_ACTIONS.find((c) => c.value === item.clickAction)!;
  return (
    <div className="space-y-4">
      {placement.shape === 'banner' ? <BannerScreen item={item} placement={placement} /> : <CoverScreen item={item} placement={placement} />}

      <dl className="space-y-3 text-sm">
        <Row label="On click">
          <span className="flex items-start gap-1.5 min-w-0 font-medium">
            <Icon icon={action.icon} width={16} height={16} className="mt-0.5 text-[#FF6115] flex-shrink-0" />
            <span className="break-words min-w-0">{describeClick(item)}</span>
          </span>
        </Row>
        <Row label="Shown">
          {item.displayMode === 'always'
            ? 'Always'
            : item.startAt && item.endAt
              ? `${formatDay(item.startAt)} ${item.startAt.slice(11, 16)} → ${formatDay(item.endAt)} ${item.endAt.slice(11, 16)}`
              : 'Set the display period'}
        </Row>
        {placement.frequency && <Row label="Frequency">{showFrequencyLabel(item.showFrequency)}</Row>}
        <Row label="Status">
          <PromoStatusBadge status={shownAs} />
        </Row>
        <Row label="Priority">#{position} in the display order</Row>
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-20 flex-shrink-0 text-[#6B7280]">{label}</dt>
      <dd className="min-w-0 text-[#1A1A1A]">{children}</dd>
    </div>
  );
}

function AppHeader() {
  return (
    <div className="flex items-center justify-between px-1 pb-3">
      <span className="flex items-center gap-1.5">
        <span className="w-6 h-6 rounded-md bg-[#FF6115] text-white text-[9px] font-bold flex items-center justify-center">PS</span>
        <span className="text-xs font-semibold text-[#1A1A1A]">Peep Share</span>
      </span>
      <span className="flex gap-2 text-[#9CA3AF]">
        <Icon icon="solar:bell-linear" width={16} height={16} />
        <Icon icon="solar:user-circle-linear" width={16} height={16} />
      </span>
    </div>
  );
}

/** Approximate placement: the banner carousel at the top of the home screen. */
function BannerScreen({ item, placement }: { item: PromoItem; placement: Placement }) {
  return (
    <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F5F7FA] p-3">
      <AppHeader />
      {item.image ? (
        <PromoThumbnail item={item} shape="banner" className="w-full rounded-xl" />
      ) : (
        <div className="aspect-[1432/480] rounded-xl border border-dashed border-[#D1D5DB] bg-white flex flex-col items-center justify-center text-center px-3">
          <Icon icon="solar:gallery-wide-linear" width={22} height={22} className="text-[#9CA3AF]" />
          <span className="mt-1 text-[11px] text-[#9CA3AF]">{placement.imageSize}</span>
        </div>
      )}
      <div className="mt-2 flex justify-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 rounded-full ${i === 0 ? 'w-4 bg-[#FF6115]' : 'w-1.5 bg-[#D1D5DB]'}`} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2" aria-hidden="true">
        <div className="h-14 rounded-lg bg-white" />
        <div className="h-14 rounded-lg bg-white" />
      </div>
    </div>
  );
}

/** Popup over the dimmed app as it opens: the image alone (tapping it runs the click action), plus a close button. */
function CoverScreen({ item, placement }: { item: PromoItem; placement: Placement }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px] aspect-[9/17] rounded-[28px] border border-[#E5E7EB] bg-[#F5F7FA] p-3 overflow-hidden">
      {/* The app underneath */}
      <div aria-hidden="true">
        <AppHeader />
        <div className="aspect-[1432/480] rounded-xl bg-white" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="h-24 rounded-lg bg-white" />
          <div className="h-24 rounded-lg bg-white" />
        </div>
        <div className="mt-2 h-24 rounded-lg bg-white" />
        <div className="mt-2 h-16 rounded-lg bg-white" />
      </div>
      {/* Popup */}
      <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3">
        <div className="w-[84%] rounded-2xl overflow-hidden bg-white shadow-xl">
          {item.image ? (
            <PromoThumbnail item={item} shape="cover" className="w-full rounded-none" />
          ) : (
            <div className="aspect-[3/4] flex flex-col items-center justify-center text-center px-4 bg-white">
              <Icon icon="solar:gallery-linear" width={26} height={26} className="text-[#9CA3AF]" />
              <span className="mt-1 text-[11px] text-[#9CA3AF]">{placement.imageSize}</span>
            </div>
          )}
        </div>
        <span className="w-8 h-8 rounded-full bg-white/90 text-[#374151] flex items-center justify-center shadow" title="Users can close the popup">
          <Icon icon="solar:close-linear" width={16} height={16} />
        </span>
      </div>
    </div>
  );
}
