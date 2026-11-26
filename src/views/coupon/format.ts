import { useMemo } from 'react';
import { useLanguage } from '@/i18n';

/** Dates and numbers in the admin's language (Thai uses the Buddhist year, as Thai users expect). */
export function useCouponFormat() {
  const { lang } = useLanguage();
  return useMemo(() => {
    const locale = lang === 'th' ? 'th-TH' : 'en-GB';
    const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
    return {
      date: (iso: string) => date.format(new Date(iso)),
      time: (iso: string) => time.format(new Date(iso)),
      dateTime: (iso: string) => `${date.format(new Date(iso))} ${time.format(new Date(iso))}`,
      number: (n: number) => n.toLocaleString(locale),
      /** 0.123 → "12.3%". */
      percent: (n: number) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(n),
      /** Short day for chart axes, e.g. "24 Nov". */
      day: (iso: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(iso)),
    };
  }, [lang]);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO → the local 'YYYY-MM-DD' and 'HH:mm' that date / time inputs use. */
export function toLocalParts(iso: string | undefined): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

/** Local date + time inputs → ISO, or '' while either is empty. */
export function fromLocalParts(date: string, time: string): string {
  return date && time ? new Date(`${date}T${time}`).toISOString() : '';
}

/** Two letters for an avatar. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** "1 coupon across 1 partner", "3 coupons across 2 partners". */
export function couponsAcrossBrands(t: (key: string, vars?: Record<string, string | number>) => string, count: number, brands: number): string {
  if (count === 1) return t('1 coupon across 1 partner');
  return brands === 1 ? t('{count} coupons across 1 partner', { count }) : t('{count} coupons across {brands} partners', { count, brands });
}
