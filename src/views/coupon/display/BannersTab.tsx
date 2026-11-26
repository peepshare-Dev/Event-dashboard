import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import Toggle from '../../../components/ui/Toggle';
import PromoStatusBadge from '../../set-event/promo/PromoStatusBadge';
import { bannerStatus, type Banner, type Brand } from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import { moveItem, useDragReorder } from '@/lib/useDragReorder';
import type { ToastAction } from '../CouponApp';
import { useCan } from '../CouponRoleContext';
import { useCouponFormat } from '../format';
import BannerDrawer from './BannerDrawer';
import LandingPreview from './LandingPreview';
import OrderBar from './OrderBar';
import { useT } from '@/i18n';

interface BannersTabProps {
  /** In saved display order. */
  banners: Banner[];
  onBannersChange: (banners: Banner[]) => void;
  /** Partner logos showing now, for the preview. */
  logos: Brand[];
  onToast: (message: string, action?: ToastAction) => void;
  onDirtyChange: (dirty: boolean) => void;
}

// Coupon landing banners: reorder (drag or arrows) then Save order; on/off saves right away.
export default function BannersTab({ banners, onBannersChange, logos, onToast, onDirtyChange }: BannersTabProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const canEdit = useCan('banner.write');
  const [order, setOrder] = useState<string[]>(() => banners.map((b) => b.id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Banner | 'new' | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Local order first; banners added since keep the saved order at the end.
  const ordered = useMemo(() => {
    const byId = new Map(banners.map((b) => [b.id, b]));
    const ids = [...order.filter((id) => byId.has(id)), ...banners.map((b) => b.id).filter((id) => !order.includes(id))];
    return ids.map((id) => byId.get(id)!);
  }, [banners, order]);
  const dirty = ordered.some((b, i) => b.id !== banners[i]?.id);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const reorder = (next: Banner[]) => setOrder(next.map((b) => b.id));
  const { dragId, itemProps } = useDragReorder(ordered, reorder, canEdit);
  const move = (from: number, to: number) => {
    reorder(moveItem(ordered, from, to));
    setAnnouncement(t('{name} moved to position {position} of {total}.', { name: ordered[from].title, position: to + 1, total: ordered.length }));
  };

  const saveOrder = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await couponApi.banners.reorder(ordered.map((b) => b.id));
      onBannersChange(saved);
      setOrder(saved.map((b) => b.id));
      onToast(t('Banner order saved.'));
    } catch (e) {
      setError(e instanceof CouponApiError ? e.message : t('Couldn’t save the order. Check your connection and try again.'));
    } finally {
      setSaving(false);
    }
  };

  // Undo runs after later renders, so it must read the newest list.
  const latest = useRef(banners);
  latest.current = banners;
  const setActive = async (b: Banner, isActive: boolean, undoable = true) => {
    const apply = (on: boolean) => onBannersChange(latest.current.map((x) => (x.id === b.id ? { ...x, isActive: on } : x)));
    apply(isActive);
    setError('');
    try {
      await couponApi.banners.setActive(b.id, isActive);
      if (undoable)
        onToast(isActive ? t('Banner turned on') : t('Banner turned off'), {
          label: t('Undo'),
          onClick: () => setActive(b, !isActive, false).then(() => onToast(t('Change undone.'))),
        });
    } catch (e) {
      apply(!isActive);
      setError(e instanceof CouponApiError ? e.message : t('Couldn’t change the banner. Check your connection and try again.'));
    }
  };
  const live = ordered.filter((b) => bannerStatus(b) === 'Active');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-[#6B7280]">
            {t('Banners show in this order. Inactive, scheduled and ended banners keep their place.')}
          </p>
          {canEdit && (
            <Button pill icon="solar:add-linear" onClick={() => setEditing('new')} className="whitespace-nowrap flex-shrink-0">
              {t('Add banner')}
            </Button>
          )}
        </div>

        {canEdit && ordered.length > 1 && (
          <OrderBar
            dirty={dirty}
            saving={saving}
            error={error}
            hint={t('Drag cards, or use the arrow buttons, to change the order.')}
            onSave={saveOrder}
            onDiscard={() => {
              setOrder(banners.map((b) => b.id));
              setError('');
            }}
          />
        )}
        {!canEdit && error && <p role="alert" className="text-sm text-[#DC2626]">{error}</p>}

        {ordered.length === 0 ? (
          <div className="border border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center text-center py-14 px-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
              <Icon icon="solar:gallery-wide-linear" width={22} height={22} className="text-[#FF6115]" />
            </div>
            <p className="text-sm font-semibold text-[#1A1A1A]">{t('No banners yet')}</p>
            <p className="text-sm text-[#6B7280] mt-1 max-w-sm">{t('Banners show as a carousel at the top of the Coupon landing screen.')}</p>
            {canEdit && (
              <Button icon="solar:add-linear" onClick={() => setEditing('new')} className="mt-4">
                {t('Add banner')}
              </Button>
            )}
          </div>
        ) : (
          <ol aria-label={t('Banner display order')} className="space-y-3">
            {ordered.map((b, i) => {
              const status = bannerStatus(b);
              return (
                <li
                  key={b.id}
                  {...itemProps(b)}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border bg-white p-3 transition-shadow ${
                    dragId === b.id ? 'border-[#FF6115] shadow-lg opacity-80' : 'border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {canEdit && (
                      <span className="hidden sm:block cursor-grab active:cursor-grabbing text-[#9CA3AF] flex-shrink-0" title={t('Drag to reorder')} aria-hidden="true">
                        <Icon icon="solar:hamburger-menu-linear" width={20} height={20} />
                      </span>
                    )}
                    <span className="w-7 h-7 rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#374151] flex items-center justify-center flex-shrink-0" aria-label={t('Position {position}', { position: i + 1 })}>
                      {i + 1}
                    </span>
                    <img src={b.imageUrl} alt="" className="w-[120px] sm:w-[156px] aspect-[1432/480] object-cover rounded-lg bg-[#F3F4F6] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">{b.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B7280] min-w-0">
                        <Icon icon="solar:calendar-linear" width={13} height={13} className="flex-shrink-0" />
                        <span className="truncate">
                          {b.startDate || b.endDate
                            ? `${b.startDate ? fmt.dateTime(b.startDate) : '…'} → ${b.endDate ? fmt.dateTime(b.endDate) : '…'}`
                            : t('No schedule — shows whenever it’s active')}
                        </span>
                      </p>
                      {b.linkUrl && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B7280] min-w-0">
                          <Icon icon="solar:link-linear" width={13} height={13} className="flex-shrink-0" />
                          <span className="truncate">{b.linkUrl}</span>
                        </p>
                      )}
                      <div className="mt-1.5">
                        <PromoStatusBadge status={status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end border-t sm:border-0 border-[#F0F0F0] pt-2 sm:pt-0">
                    {/* Wrapper carries the tooltip, since disabled buttons don't receive hover events everywhere. */}
                    <span title={canEdit ? undefined : t('Only Admins can change what shows in the app.')} className="inline-flex">
                      <Toggle checked={b.isActive} onChange={(on) => setActive(b, on)} label={t('Active')} disabled={!canEdit} />
                    </span>
                    {canEdit && (
                      <div className="flex items-center gap-0.5">
                        <IconButton icon="solar:pen-new-square-linear" label={t('Edit {name}', { name: b.title })} onClick={() => setEditing(b)} />
                        <IconButton icon="solar:alt-arrow-up-linear" label={t('Move {name} up', { name: b.title })} disabled={i === 0} onClick={() => move(i, i - 1)} />
                        <IconButton icon="solar:alt-arrow-down-linear" label={t('Move {name} down', { name: b.title })} disabled={i === ordered.length - 1} onClick={() => move(i, i + 1)} />
                      </div>
                    )}
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

      {/* Preview */}
      <aside className="lg:sticky lg:top-6 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
        <p className="text-sm font-semibold text-[#1A1A1A]">{t('App preview')}</p>
        <p className="mt-0.5 mb-4 text-xs text-[#6B7280]">
          {t('{live} of {total} banners showing now, in the order above (saved or not).', { live: live.length, total: ordered.length })}
        </p>
        <LandingPreview banners={live} logos={logos} />
      </aside>

      {editing && (
        <BannerDrawer
          banner={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved, created) => {
            onBannersChange(created ? [...banners, saved] : banners.map((b) => (b.id === saved.id ? saved : b)));
            onToast(created ? t('Banner added at the end of the order.') : t('Banner saved.'));
            setEditing(null);
          }}
          onDeleted={(deleted) => {
            onBannersChange(banners.filter((b) => b.id !== deleted.id));
            onToast(t('Banner deleted.'));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function IconButton({ icon, label, disabled, onClick }: { icon: string; label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
    >
      <Icon icon={icon} width={18} height={18} />
    </button>
  );
}
