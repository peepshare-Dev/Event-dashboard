import { Icon } from '@iconify/react';
import { sanitizeHtml, htmlToText } from '@/lib/sanitizeHtml';
import { useCouponFormat } from '../format';
import { useT } from '@/i18n';

interface CouponAppPreviewProps {
  imageUrl?: string;
  title: string;
  brandName?: string;
  brandLogoUrl?: string;
  conditionsHtml: string;
  /** ISO, or '' while unset. */
  expiresAt: string;
  remaining: number;
}

// Phone-sized copy of the app's "Coupon Detail" screen, updated as the admin types.
export default function CouponAppPreview({ imageUrl, title, brandName, brandLogoUrl, conditionsHtml, expiresAt, remaining }: CouponAppPreviewProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const hasConditions = Boolean(htmlToText(conditionsHtml));

  return (
    <div className="mx-auto w-full max-w-[300px] aspect-[9/18] rounded-[28px] border border-[#E5E7EB] bg-[#F5F7FA] overflow-hidden flex flex-col">
      {/* App bar */}
      <div className="flex items-center gap-2 px-3 h-11 bg-white border-b border-[#F0F0F0] flex-shrink-0" aria-hidden="true">
        <Icon icon="solar:arrow-left-linear" width={18} height={18} className="text-[#1A1A1A]" />
        <span className="flex-1 text-center text-[13px] font-semibold text-[#1A1A1A] -ml-[18px]">{t('Coupon detail')}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full aspect-square object-cover rounded-xl bg-white" />
        ) : (
          <div className="w-full aspect-square rounded-xl border border-dashed border-[#D1D5DB] bg-white flex flex-col items-center justify-center text-center">
            <Icon icon="solar:gallery-linear" width={24} height={24} className="text-[#9CA3AF]" />
            <span className="mt-1 text-[11px] text-[#9CA3AF]">1080 × 1080</span>
          </div>
        )}

        <div className="rounded-xl bg-white p-3">
          <div className="flex items-center gap-2">
            {brandLogoUrl ? (
              <img src={brandLogoUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-[#F3F4F6] flex-shrink-0" />
            )}
            <span className={`text-xs truncate ${brandName ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>{brandName || t('Partner')}</span>
          </div>
          <p className={`mt-2 text-[15px] font-semibold leading-snug break-words ${title ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}>{title || t('Coupon title')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6B7280]">
            <span className="inline-flex items-center gap-1">
              <Icon icon="solar:clock-circle-linear" width={13} height={13} />
              {expiresAt ? t('Valid until {date}', { date: fmt.dateTime(expiresAt) }) : t('Set the expiry date')}
            </span>
            <span className="inline-flex items-center gap-1 text-[#FF6115] font-medium">
              <Icon icon="solar:ticket-sale-linear" width={13} height={13} />
              {t('{count} left', { count: fmt.number(remaining) })}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <p className="text-xs font-semibold text-[#1A1A1A]">{t('Terms and conditions')}</p>
          {hasConditions ? (
            <div className="rich-text mt-1.5 text-[11px] leading-relaxed text-[#4B5563]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(conditionsHtml) }} />
          ) : (
            <p className="mt-1.5 text-[11px] text-[#9CA3AF]">{t('Conditions appear here.')}</p>
          )}
        </div>
      </div>

      <div className="p-3 bg-white border-t border-[#F0F0F0] flex-shrink-0" aria-hidden="true">
        <div className="h-10 rounded-full bg-[#FF6115] text-white text-sm font-semibold flex items-center justify-center">{t('Claim coupon')}</div>
      </div>
    </div>
  );
}
