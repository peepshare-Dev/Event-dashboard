import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import type { Banner, Brand } from '../../../data/coupons';
import { useT } from '@/i18n';

/** "Partner with PEEPS": the round logo row, in display order. */
export function PartnerLogoRow({ brands, size = 'md' }: { brands: Brand[]; size?: 'sm' | 'md' }) {
  const t = useT();
  const sm = size === 'sm';
  if (!brands.length) return <p className={`text-[#9CA3AF] ${sm ? 'text-[11px]' : 'text-sm'}`}>{t('No partner logos meet the rules right now, so the app hides this row.')}</p>;
  return (
    <ul className={`flex overflow-x-auto pb-1 ${sm ? 'gap-3' : 'gap-5'}`}>
      {brands.map((s) => (
        <li key={s.id} className={`flex-shrink-0 flex flex-col items-center ${sm ? 'w-12' : 'w-24'}`}>
          <img src={s.logoUrl} alt="" className={`rounded-full object-cover border border-[#E5E7EB] bg-white ${sm ? 'w-11 h-11' : 'w-14 h-14'}`} />
          <span className={`mt-1 w-full text-center truncate text-[#374151] ${sm ? 'text-[9px]' : 'text-xs'}`}>{s.name}</span>
        </li>
      ))}
    </ul>
  );
}

interface LandingPreviewProps {
  /** Banners showing now, in display order. */
  banners: Banner[];
  /** Partner logos showing now, in display order. */
  logos: Brand[];
}

// Phone-sized copy of the app's coupon landing screen: banner carousel, partner logos, coupon cards.
export default function LandingPreview({ banners, logos }: LandingPreviewProps) {
  const t = useT();
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const current = Math.min(slide, Math.max(0, banners.length - 1));

  return (
    <div className="mx-auto w-full max-w-[300px] aspect-[9/18] rounded-[28px] border border-[#E5E7EB] bg-[#F5F7FA] overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-3 h-11 bg-white border-b border-[#F0F0F0] flex-shrink-0" aria-hidden="true">
        <Icon icon="solar:arrow-left-linear" width={18} height={18} className="text-[#1A1A1A]" />
        <span className="flex-1 text-center text-[13px] font-semibold text-[#1A1A1A] -ml-[18px]">{t('Coupons')}</span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {/* Banner carousel */}
        {banners.length ? (
          <div>
            <div
              ref={trackRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const first = el.firstElementChild as HTMLElement | null;
                if (first) setSlide(Math.round(el.scrollLeft / (first.offsetWidth + 8)));
              }}
              className="flex gap-2 overflow-x-auto snap-x snap-mandatory px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label={t('Banner carousel')}
            >
              {banners.map((b) => (
                <img key={b.id} src={b.imageUrl} alt={b.title} className="w-[88%] flex-shrink-0 snap-center aspect-[1432/480] object-cover rounded-xl bg-white" />
              ))}
            </div>
            <div className="mt-2 flex justify-center gap-1" aria-hidden="true">
              {banners.map((b, i) => (
                <span key={b.id} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-[#FF6115]' : 'w-1.5 bg-[#D1D5DB]'}`} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-3 aspect-[1432/480] rounded-xl border border-dashed border-[#D1D5DB] bg-white flex items-center justify-center px-3 text-center">
            <span className="text-[11px] text-[#9CA3AF]">{t('No banners are showing, so the app hides the carousel.')}</span>
          </div>
        )}

        {/* Partner logos */}
        <div className="mx-3 rounded-xl bg-white p-3">
          <p className="text-xs font-semibold text-[#1A1A1A] mb-2">{t('Partner with PEEPS')}</p>
          <PartnerLogoRow brands={logos} size="sm" />
        </div>

        {/* Coupon cards (placeholder) */}
        <div className="mx-3 grid grid-cols-2 gap-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white p-2">
              <div className="aspect-square rounded-lg bg-[#F3F4F6]" />
              <div className="mt-2 h-2 w-3/4 rounded bg-[#F3F4F6]" />
              <div className="mt-1 h-2 w-1/2 rounded bg-[#F3F4F6]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
