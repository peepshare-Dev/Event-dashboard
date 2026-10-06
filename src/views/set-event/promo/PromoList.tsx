import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import SearchInput from '../../../components/ui/SearchInput';
import FilterSelect from '../../../components/ui/FilterSelect';
import DateRangePicker from '../../../components/ui/DateRangePicker';
import ActionMenu, { type ActionMenuItem } from '../../../components/ui/ActionMenu';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import Modal from '../../../components/ui/Modal';
import PromoStatusBadge, { PROMO_STATUSES } from './PromoStatusBadge';
import { PromoThumbnail } from './PromoPreview';
import type { Placement } from './placements';
import {
  CLICK_ACTIONS,
  SHOW_FREQUENCIES,
  clickActionLabel,
  describeClick,
  describePeriod,
  displayStatus,
  overlapsPeriod,
  showFrequencyLabel,
  type BannerStatus,
  type PromoItem,
} from '../../../data/appBanners';

const STATUS_OPTIONS = ['All', ...PROMO_STATUSES] as const;
const ACTION_OPTIONS = ['All', ...CLICK_ACTIONS.map((c) => c.label)] as const;
const FREQUENCY_OPTIONS = ['All', ...SHOW_FREQUENCIES.map((f) => f.label)] as const;

interface PromoListProps {
  placement: Placement;
  items: PromoItem[];
  loadState: 'loading' | 'error' | 'ready';
  actionError: string;
  /** Item with an action in flight. */
  busyId: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (b: PromoItem) => void;
  onSort: (focusId?: string) => void;
  onDuplicate: (b: PromoItem) => void;
  onSetStatus: (b: PromoItem, status: BannerStatus) => void;
  onDelete: (b: PromoItem) => void;
}

// Banner / Cover Page list: search, filters, table (cards on phones) and the row action menu.
export default function PromoList(props: PromoListProps) {
  const { placement, items: banners, loadState, actionError, busyId, onRetry, onCreate, onEdit, onSort, onDuplicate, onSetStatus, onDelete } = props;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('All');
  const [action, setAction] = useState<(typeof ACTION_OPTIONS)[number]>('All');
  const [period, setPeriod] = useState({ start: '', end: '' });
  const [frequency, setFrequency] = useState<(typeof FREQUENCY_OPTIONS)[number]>('All');
  const noun = placement.noun;
  const isBanner = placement.shape === 'banner';
  const [deleting, setDeleting] = useState<PromoItem | null>(null);
  const [deactivating, setDeactivating] = useState<PromoItem | null>(null);

  const term = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      banners.filter(
        (b) =>
          (!term || `${b.name} ${describeClick(b)}`.toLowerCase().includes(term)) &&
          (status === 'All' || displayStatus(b) === status) &&
          (action === 'All' || clickActionLabel(b.clickAction) === action) &&
          (frequency === 'All' || showFrequencyLabel(b.showFrequency) === frequency) &&
          overlapsPeriod(b, period.start, period.end),
      ),
    [banners, term, status, action, frequency, period],
  );
  const filtered = Boolean(term) || status !== 'All' || action !== 'All' || frequency !== 'All' || Boolean(period.start || period.end);
  const clearFilters = () => {
    setSearch('');
    setStatus('All');
    setAction('All');
    setPeriod({ start: '', end: '' });
    setFrequency('All');
  };
  const liveCount = banners.filter((b) => displayStatus(b) === 'Active').length;

  const menuItems = (b: PromoItem): ActionMenuItem[] => {
    const shown = displayStatus(b);
    return [
      { label: 'Edit', icon: 'solar:pen-new-square-linear', onClick: () => onEdit(b) },
      { label: 'Duplicate', icon: 'solar:copy-linear', onClick: () => onDuplicate(b) },
      { label: 'Change Priority', icon: 'solar:sort-vertical-linear', onClick: () => onSort(b.id) },
      b.status === 'active'
        ? {
            label: 'Deactivate',
            icon: 'solar:eye-closed-linear',
            // Ask first when it's on screen now, or about to be.
            onClick: () => (shown === 'Active' || shown === 'Scheduled' ? setDeactivating(b) : onSetStatus(b, 'inactive')),
          }
        : { label: 'Activate', icon: 'solar:eye-linear', onClick: () => onSetStatus(b, 'active') },
      { label: 'Delete', icon: 'solar:trash-bin-trash-linear', onClick: () => setDeleting(b), destructive: true },
    ];
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
        <PageHeader
          title={placement.menuTitle}
          icon={placement.icon}
          description={placement.subtitle}
          actions={
            <>
              <Button
                variant="secondary"
                pill
                icon="solar:sort-vertical-linear"
                onClick={() => onSort()}
                disabled={loadState !== 'ready' || banners.length < 2}
                aria-label={`Sort ${noun}`}
                className="whitespace-nowrap"
              >
                <span className="sm:hidden">Sort</span>
                <span className="hidden sm:inline">Sort {noun}</span>
              </Button>
              <Button pill icon="solar:add-linear" onClick={onCreate} className="whitespace-nowrap flex-1 sm:flex-none">
                Create {noun}
              </Button>
            </>
          }
        />

        {loadState === 'ready' && banners.length > 0 && (
          <p className="mt-4 text-sm text-[#6B7280]">
            <span className="font-semibold text-[#1A1A1A]">{liveCount}</span> of {banners.length} {isBanner ? 'banners showing in the app' : 'cover pages showing to users'} now
          </p>
        )}

        {/* Search + filters */}
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder={`Search ${noun.toLowerCase()}`} className="w-full lg:w-64 flex-shrink-0" />
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterSelect label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
            <FilterSelect label="Click Action" value={action} options={ACTION_OPTIONS} onChange={setAction} />
            {placement.frequency && <FilterSelect label="Show Frequency" value={frequency} options={FREQUENCY_OPTIONS} onChange={setFrequency} />}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7280] whitespace-nowrap">Display period</span>
              <DateRangePicker start={period.start} end={period.end} onChange={setPeriod} />
            </div>
            {filtered && (
              <button type="button" onClick={clearFilters} className="h-8 px-2 text-xs text-[#6B7280] underline underline-offset-2 hover:text-[#FF6115]">
                Clear all
              </button>
            )}
          </div>
        </div>

        {actionError && (
          <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
            {actionError}
          </p>
        )}

        {loadState === 'loading' ? (
          <LoadingRows />
        ) : loadState === 'error' ? (
          <StateBox icon="solar:cloud-cross-linear" title={`Couldn’t load ${noun.toLowerCase()}s`} text="Something went wrong while loading. Check your connection and try again.">
            <Button variant="secondary" icon="solar:refresh-linear" onClick={onRetry}>
              Retry
            </Button>
          </StateBox>
        ) : banners.length === 0 ? (
          <StateBox icon={placement.icon} title={`No ${noun.toLowerCase()}s yet`} text={placement.emptyText}>
            <Button icon="solar:add-linear" onClick={onCreate}>
              Create {noun}
            </Button>
          </StateBox>
        ) : visible.length === 0 ? (
          <StateBox icon="solar:magnifer-linear" title={`No ${noun.toLowerCase()}s match your filters`} text="Try a different search or clear the filters.">
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </StateBox>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block mt-4 overflow-x-auto border-b border-[#E5E7EB]">
              <table className={`w-full ${placement.frequency ? 'min-w-[980px]' : 'min-w-[900px]'}`}>
                <thead>
                  <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                    <th scope="col" className={`h-11 pl-4 pr-4 ${isBanner ? 'w-[210px]' : 'w-[110px]'}`}>{noun}</th>
                    <th scope="col" className="px-4">Name</th>
                    <th scope="col" className="px-4">Click Action</th>
                    <th scope="col" className="px-4">Display Period</th>
                    {placement.frequency && <th scope="col" className="px-4">Show Frequency</th>}
                    <th scope="col" className="px-4">Status</th>
                    <th scope="col" className="w-16"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {visible.map((b) => (
                    <tr key={b.id} className={`hover:bg-[#FAFAFA] transition-colors ${busyId === b.id ? 'opacity-50 pointer-events-none' : ''}`}>
                      <td className="pl-4 pr-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[11px] font-semibold text-[#374151] flex items-center justify-center flex-shrink-0"
                            title={`Display priority ${b.priority}`}
                          >
                            {b.priority}
                          </span>
                          <PromoThumbnail item={b} shape={placement.shape} className={isBanner ? 'w-[156px]' : 'w-[54px]'} />
                        </div>
                      </td>
                      <td className="px-4">
                        <button
                          type="button"
                          onClick={() => onEdit(b)}
                          className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline"
                        >
                          {b.name}
                        </button>
                      </td>
                      <td className="px-4">
                        <ClickSummary banner={b} />
                      </td>
                      <td className="px-4 text-[13px] text-[#374151] whitespace-nowrap">
                        {describePeriod(b)}
                        {b.displayMode === 'schedule' && (
                          <span className="block text-xs text-[#9CA3AF]">
                            {b.startAt.slice(11, 16)} – {b.endAt.slice(11, 16)}
                          </span>
                        )}
                      </td>
                      {placement.frequency && (
                        <td className="px-4 text-[13px] text-[#374151] whitespace-nowrap">
                          <FrequencyLabel item={b} />
                        </td>
                      )}
                      <td className="px-4">
                        <PromoStatusBadge status={displayStatus(b)} />
                      </td>
                      <td className="pr-3 text-right">
                        <ActionMenu label={`Actions for ${b.name}`} items={menuItems(b)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="md:hidden mt-4 space-y-3">
              {visible.map((b) => (
                <li
                  key={b.id}
                  className={`rounded-xl border border-[#E5E7EB] overflow-hidden ${isBanner ? '' : 'flex'} ${busyId === b.id ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <PromoThumbnail item={b} shape={placement.shape} className={isBanner ? 'w-full rounded-none' : 'w-24 flex-shrink-0 self-start rounded-none'} />
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          <span className="text-[#9CA3AF] font-medium">#{b.priority}</span> {b.name}
                        </p>
                        <div className="mt-1.5">
                          <PromoStatusBadge status={displayStatus(b)} />
                        </div>
                      </div>
                      <ActionMenu label={`Actions for ${b.name}`} items={menuItems(b)} />
                    </div>
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                      <dt className="text-[#9CA3AF]">On click</dt>
                      <dd className="text-[#374151] min-w-0 truncate">{describeClick(b)}</dd>
                      <dt className="text-[#9CA3AF]">Period</dt>
                      <dd className="text-[#374151]">{describePeriod(b)}</dd>
                      {placement.frequency && (
                        <>
                          <dt className="text-[#9CA3AF]">Frequency</dt>
                          <dd className="text-[#374151]">{showFrequencyLabel(b.showFrequency)}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {deleting && (
        <DeleteConfirmationModal
          title={`Delete ${noun}?`}
          message={
            <>
              Are you sure you want to delete <span className="font-semibold text-[#1A1A1A]">‘{deleting.name}’</span>? It will be removed from the app and can’t be
              restored.
            </>
          }
          onConfirm={() => {
            onDelete(deleting);
            setDeleting(null);
          }}
          onClose={() => setDeleting(null)}
        />
      )}

      {deactivating && (
        <Modal
          title={`Deactivate ${noun}?`}
          onClose={() => setDeactivating(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeactivating(null)} autoFocus>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSetStatus(deactivating, 'inactive');
                  setDeactivating(null);
                }}
              >
                Deactivate
              </Button>
            </>
          }
        >
          <p className="text-sm text-[#4B5563]">
            <span className="font-semibold text-[#1A1A1A]">{deactivating.name}</span> {placement.deactivateText} You can activate it again later.
          </p>
        </Modal>
      )}
    </div>
  );
}

function FrequencyLabel({ item }: { item: PromoItem }) {
  const f = SHOW_FREQUENCIES.find((x) => x.value === item.showFrequency);
  if (!f) return <span className="text-[#9CA3AF]">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon icon={f.icon} width={15} height={15} className="text-[#9CA3AF]" />
      {f.label}
    </span>
  );
}

function ClickSummary({ banner }: { banner: PromoItem }) {
  const action = CLICK_ACTIONS.find((c) => c.value === banner.clickAction)!;
  const target = describeClick(banner).split(' → ')[1];
  return (
    <div className="flex items-start gap-2 min-w-0 max-w-[240px]">
      <Icon icon={action.icon} width={16} height={16} className="mt-0.5 text-[#FF6115] flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#1A1A1A]">{action.label}</p>
        {target && <p className="text-xs text-[#6B7280] truncate" title={target}>{target}</p>}
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div role="status" aria-label="Loading banners" className="mt-4 space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-[#F0F0F0] p-3 animate-pulse">
          <div className="w-[176px] max-w-[40%] aspect-[1432/480] rounded-lg bg-[#F3F4F6]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-[#F3F4F6]" />
            <div className="h-3 w-1/4 rounded bg-[#F3F4F6]" />
          </div>
          <div className="hidden sm:block h-6 w-16 rounded-full bg-[#F3F4F6]" />
        </div>
      ))}
    </div>
  );
}

function StateBox({ icon, title, text, children }: { icon: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
        <Icon icon={icon} width={22} height={22} className="text-[#FF6115]" />
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
      <p className="text-sm text-[#6B7280] mt-1 max-w-sm">{text}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
