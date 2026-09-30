import { Icon } from '@iconify/react';
import PageHeader from '../../components/ui/PageHeader';
import type { SetEvent } from '../../data/setEvents';

interface BannerImageProps {
  events: SetEvent[];
  /** Opens the event the banner belongs to. */
  onOpenEvent: (event: SetEvent) => void;
}

// Banners aren't uploaded here — each one comes from the Choose Banner field of an event.
export default function BannerImage({ events, onOpenEvent }: BannerImageProps) {
  const withBanner = events.filter((e) => e.details?.banner && e.status !== 'Trash');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
        <PageHeader
          title="Banner image"
          icon="solar:gallery-wide-linear"
          description={withBanner.length ? `${withBanner.length} banner${withBanner.length > 1 ? 's' : ''} from your events` : undefined}
        />

        {withBanner.length === 0 ? (
          <div className="mt-6 border border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
              <Icon icon="solar:gallery-wide-linear" width={22} height={22} className="text-[#FF6115]" />
            </div>
            <p className="text-sm font-semibold text-[#1A1A1A]">No banner images yet</p>
            <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
              Banners you add in Choose Banner when creating or editing an event will appear here.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {withBanner.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => onOpenEvent(ev)}
                  aria-label={`Open ${ev.name || 'Untitled'}`}
                  title={ev.name || 'Untitled'}
                  className="block w-full rounded-xl border border-[#E5E7EB] overflow-hidden hover:border-[#FF6115] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                >
                  <img
                    src={ev.details!.banner!.url}
                    alt={`Banner for ${ev.name || 'Untitled'}`}
                    className="block w-full aspect-square object-cover bg-[#F3F4F6]"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
