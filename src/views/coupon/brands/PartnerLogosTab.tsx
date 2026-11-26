import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import StatusTabs from '../../../components/ui/StatusTabs';
import { AUTO_HIDE_REASON_LABELS, partnerLogoStatus, type Coupon, type PartnerLogoStatus, type Phase, type Brand } from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import { moveItem, useDragReorder } from '@/lib/useDragReorder';
import type { ToastAction } from '../CouponApp';
import { useCan } from '../CouponRoleContext';
import { PartnerLogoRow } from '../display/LandingPreview';
import OrderBar from '../display/OrderBar';
import { useT } from '@/i18n';

const FILTERS = ['All', 'Visible', 'Hidden', 'Auto-hidden'] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_STATUS: Record<Exclude<Filter, 'All'>, PartnerLogoStatus['status']> = { Visible: 'visible', Hidden: 'hidden', 'Auto-hidden': 'auto_hidden' };

interface PartnerLogosTabProps {
  /** In saved display order. */
  brands: Brand[];
  onBrandsChange: (brands: Brand[]) => void;
  coupons: Coupon[];
  phases: Phase[];
  onToast: (message: string, action?: ToastAction) => void;
  onDirtyChange: (dirty: boolean) => void;
  /** Visibility is changed on the partner's page. */
  onOpenBrand: (brandId: string) => void;
}

// Partners > Logo order: the "Partner with PEEPS" logos in the app, drag (or arrows) to reorder, with a
// preview. Whether a logo shows is decided on the partner's page (partner switch, contract dates) and by
// its coupons, so each tile links there.
export default function PartnerLogosTab({ brands, onBrandsChange, coupons, phases, onToast, onDirtyChange, onOpenBrand }: PartnerLogosTabProps) {
  const t = useT();
  const canEdit = useCan('banner.write');
  const [order, setOrder] = useState<string[]>(() => brands.map((s) => s.id));
  const [filter, setFilter] = useState<Filter>('All');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');

  const ordered = useMemo(() => {
    const byId = new Map(brands.map((s) => [s.id, s]));
    const ids = [...order.filter((id) => byId.has(id)), ...brands.map((s) => s.id).filter((id) => !order.includes(id))];
    return ids.map((id) => byId.get(id)!);
  }, [brands, order]);
  const dirty = ordered.some((s, i) => s.id !== brands[i]?.id);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const statusOf = useMemo(() => new Map(brands.map((s) => [s.id, partnerLogoStatus(s, coupons, phases)])), [brands, coupons, phases]);
  const counts = { All: brands.length } as Record<Filter, number>;
  (Object.keys(FILTER_STATUS) as Exclude<Filter, 'All'>[]).forEach((f) => (counts[f] = brands.filter((s) => statusOf.get(s.id)!.status === FILTER_STATUS[f]).length));
  const shown = filter === 'All' ? ordered : ordered.filter((s) => statusOf.get(s.id)!.status === FILTER_STATUS[filter]);
  const visibleInApp = ordered.filter((s) => statusOf.get(s.id)!.status === 'visible');
  // Reordering a filtered subset would be ambiguous, so it's only offered on All.
  const canReorder = canEdit && filter === 'All';

  const reorder = (next: Brand[]) => setOrder(next.map((s) => s.id));
  const { dragId, itemProps } = useDragReorder(ordered, reorder, canReorder);
  const move = (from: number, to: number) => {
    reorder(moveItem(ordered, from, to));
    setAnnouncement(t('{name} moved to position {position} of {total}.', { name: ordered[from].name, position: to + 1, total: ordered.length }));
  };

  const saveOrder = async () => {
    setSaving(true);
    setError('');
    try {
      const ids = ordered.map((s) => s.id);
      const saved = await couponApi.brands.reorderLogos(ids);
      onBrandsChange(ids.map((id) => saved.find((s) => s.id === id)!));
      setOrder(ids);
      onToast(t('Logo order saved.'));
    } catch (e) {
      setError(e instanceof CouponApiError ? e.message : t('Couldn’t save the order. Check your connection and try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Preview strip */}
      <section aria-labelledby="partner-strip-title" className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p id="partner-strip-title" className="text-sm font-semibold text-[#1A1A1A]">
            {t('App preview')}
          </p>
          <p className="text-xs text-[#6B7280]">{t('{count} of {total} logos showing, in the order below (saved or not).', { count: visibleInApp.length, total: brands.length })}</p>
        </div>
        <div className="mt-3 rounded-xl bg-white border border-[#F0F0F0] p-4">
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">{t('Partner with PEEPS')}</p>
          <PartnerLogoRow brands={visibleInApp} />
        </div>
      </section>

      <p className="text-sm text-[#6B7280]">
        {t('A logo shows only when the partner is active, its contract hasn’t ended, and it has at least one active, unexpired coupon with stock left in an active campaign. Change a partner’s status on its partner page.')}
      </p>

      <StatusTabs tabs={FILTERS} active={filter} counts={counts} onChange={setFilter} />

      {canEdit &&
        (canReorder ? (
          brands.length > 1 && (
            <OrderBar
              dirty={dirty}
              saving={saving}
              error={error}
              hint={t('Drag logos, or use the arrow buttons, to change the order.')}
              onSave={saveOrder}
              onDiscard={() => {
                setOrder(brands.map((s) => s.id));
                setError('');
              }}
            />
          )
        ) : (
          <p className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Icon icon="solar:sort-vertical-linear" width={16} height={16} className="flex-shrink-0" />
            {t('Switch to All to change the order.')}
            {dirty && <span className="font-medium text-[#E5540F]">{t('You have an unsaved order.')}</span>}
          </p>
        ))}
      {(!canReorder || !canEdit) && error && (
        <p role="alert" className="text-sm text-[#DC2626]">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#6B7280] border border-dashed border-[#E5E7EB] rounded-xl">{t('No logos with this status.')}</p>
      ) : (
        <ol aria-label={t('Partner logo order')} className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {shown.map((s) => {
            const i = ordered.indexOf(s);
            const status = statusOf.get(s.id)!;
            return (
              <li
                key={s.id}
                {...itemProps(s)}
                className={`relative flex flex-col items-center text-center rounded-xl border bg-white p-4 pt-10 transition-shadow ${
                  dragId === s.id ? 'border-[#FF6115] shadow-lg opacity-80' : 'border-[#E5E7EB]'
                }`}
              >
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  {canReorder && (
                    <span className="hidden sm:block cursor-grab active:cursor-grabbing text-[#9CA3AF]" title={t('Drag to reorder')} aria-hidden="true">
                      <Icon icon="solar:hamburger-menu-linear" width={18} height={18} />
                    </span>
                  )}
                  <span className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[11px] font-semibold text-[#374151] flex items-center justify-center" aria-label={t('Position {position}', { position: i + 1 })}>
                    {i + 1}
                  </span>
                </div>
                {canReorder && (
                  <div className="absolute top-1 right-1 flex">
                    <MoveButton icon="solar:alt-arrow-left-linear" label={t('Move {name} earlier', { name: s.name })} disabled={i === 0} onClick={() => move(i, i - 1)} />
                    <MoveButton icon="solar:alt-arrow-right-linear" label={t('Move {name} later', { name: s.name })} disabled={i === ordered.length - 1} onClick={() => move(i, i + 1)} />
                  </div>
                )}

                <img
                  src={s.logoUrl}
                  alt={t('{name} logo', { name: s.name })}
                  className={`w-16 h-16 rounded-full object-cover border border-[#E5E7EB] ${status.status === 'visible' ? '' : 'opacity-50 grayscale'}`}
                />
                <p className="mt-2 text-sm font-semibold text-[#1A1A1A] max-w-full truncate">{s.name}</p>
                <div className="mt-1.5">
                  <LogoStatusBadge status={status} />
                </div>
                <p className="mt-1 text-xs text-[#6B7280] min-h-4">
                  {status.status === 'visible'
                    ? status.liveCoupons === 1
                      ? t('1 live coupon')
                      : t('{count} live coupons', { count: status.liveCoupons })
                    : status.status === 'hidden'
                      ? t('Partner switched off')
                      : t(AUTO_HIDE_REASON_LABELS[status.reason])}
                </p>
                <div className="mt-3 pt-3 border-t border-[#F0F0F0] w-full flex justify-center">
                  <button
                    type="button"
                    onClick={() => onOpenBrand(s.id)}
                    aria-label={t('Open {name} in Partners', { name: s.name })}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6115] rounded hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                  >
                    {t('Partner page')}
                    <Icon icon="solar:arrow-right-linear" width={14} height={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

const BADGE: Record<PartnerLogoStatus['status'], { label: string; badge: string; dot: string }> = {
  visible: { label: 'Visible', badge: 'bg-[#F0FDF4] text-[#15803D]', dot: 'bg-[#22C55E]' },
  hidden: { label: 'Hidden', badge: 'bg-[#F3F4F6] text-[#6B7280]', dot: 'bg-[#9CA3AF]' },
  auto_hidden: { label: 'Auto-hidden', badge: 'bg-[#FFFBEB] text-[#B45309]', dot: 'bg-[#F59E0B]' },
};

// Dot + label, same look as the coupon status badge.
function LogoStatusBadge({ status }: { status: PartnerLogoStatus }) {
  const t = useT();
  const s = BADGE[status.status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {t(s.label)}
    </span>
  );
}

function MoveButton({ icon, label, disabled, onClick }: { icon: string; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
    >
      <Icon icon={icon} width={16} height={16} />
    </button>
  );
}
