import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import StickyActionBar from '../../../components/set-event/form/StickyActionBar';
import PromoStatusBadge from './PromoStatusBadge';
import { PromoThumbnail } from './PromoPreview';
import type { Placement } from './placements';
import { describeClick, displayStatus, showFrequencyLabel, type PromoItem } from '../../../data/appBanners';

const CONTENT_WIDTH = 'max-w-[960px]';

interface PromoSortProps {
  placement: Placement;
  items: PromoItem[];
  /** Item to highlight (opened from its "Change Priority" action). */
  focusId?: string;
  onCancel: () => void;
  onSaved: (items: PromoItem[]) => void;
}

// Display priority: drag rows (or use the arrows on touch / keyboard), then Save Order.
export default function PromoSort({ placement, items: banners, focusId, onCancel, onSaved }: PromoSortProps) {
  const [order, setOrder] = useState(banners);
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLOListElement>(null);
  const changed = order.some((b, i) => b.id !== banners[i]?.id);

  useEffect(() => {
    if (!focusId) return;
    const row = listRef.current?.querySelector<HTMLElement>(`[data-id="${focusId}"]`);
    const scroller = listRef.current?.closest('main');
    if (row && scroller) scroller.scrollBy({ top: row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientHeight / 3 });
  }, [focusId]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      onSaved(await placement.api.reorder(order.map((b) => b.id)));
    } catch {
      setError('Couldn’t save the order. Check your connection and try again.');
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 pb-8 lg:pb-10">
        <div className={`${CONTENT_WIDTH} mx-auto`}>
          <h1 className="text-2xl sm:text-[28px] font-semibold leading-tight text-[#1A1A1A]">Sort {placement.noun}</h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">{placement.sortSubtitle}</p>
          <button
            type="button"
            onClick={onCancel}
            className="mt-4 inline-flex items-center gap-1.5 h-8 -ml-1 px-1 text-sm text-[#6B7280] rounded-md hover:text-[#FF6115] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:arrow-left-linear" width={16} height={16} />
            Back to {placement.noun === 'Banner' ? 'banners' : 'cover pages'}
          </button>

          {error && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
              <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
              {error}
            </p>
          )}

          <ol ref={listRef} aria-label={`${placement.noun} display order`} className="mt-5 space-y-2">
            {order.map((b, i) => {
              const status = displayStatus(b);
              return (
                <li
                  key={b.id}
                  data-id={b.id}
                  draggable
                  onDragStart={(e) => {
                    setDragId(b.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragId && dragId !== b.id) move(order.findIndex((x) => x.id === dragId), i);
                  }}
                  onDragEnd={() => setDragId(null)}
                  className={`flex items-center gap-3 rounded-xl border bg-white p-3 transition-shadow ${
                    dragId === b.id ? 'border-[#FF6115] shadow-lg opacity-80' : b.id === focusId ? 'border-[#FFB38F] ring-2 ring-[#FF6115]/20' : 'border-[#E5E7EB]'
                  }`}
                >
                  <span className="cursor-grab active:cursor-grabbing text-[#9CA3AF] flex-shrink-0" title="Drag to reorder" aria-hidden="true">
                    <Icon icon="solar:hamburger-menu-linear" width={20} height={20} />
                  </span>
                  <span className="w-7 h-7 rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#374151] flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <PromoThumbnail item={b} shape={placement.shape} className={`hidden sm:block flex-shrink-0 ${placement.shape === 'banner' ? 'w-[132px]' : 'w-[42px]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{b.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">
                      {describeClick(b)}
                      {placement.frequency && ` · ${showFrequencyLabel(b.showFrequency)}`}
                    </p>
                  </div>
                  <span className="hidden sm:block">
                    <PromoStatusBadge status={status} />
                  </span>
                  <div className="flex flex-col sm:flex-row gap-0.5 flex-shrink-0">
                    <MoveButton icon="solar:alt-arrow-up-linear" label={`Move ${b.name} up`} disabled={i === 0} onClick={() => move(i, i - 1)} />
                    <MoveButton icon="solar:alt-arrow-down-linear" label={`Move ${b.name} down`} disabled={i === order.length - 1} onClick={() => move(i, i + 1)} />
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs text-[#9CA3AF]">Inactive, draft and expired items keep their place and take it back when they show again.</p>
        </div>
      </div>

      <StickyActionBar
        maxWidth={CONTENT_WIDTH}
        note={changed ? <span className="text-[#E5540F] font-medium">Order changed — save to apply it in the app.</span> : 'Drag rows or use the arrows to reorder.'}
        tertiary={{ label: 'Cancel', onClick: onCancel, disabled: saving }}
        primary={{ label: saving ? 'Saving…' : 'Save Order', onClick: save, disabled: saving || !changed }}
      />
    </div>
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
      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
    >
      <Icon icon={icon} width={18} height={18} />
    </button>
  );
}
