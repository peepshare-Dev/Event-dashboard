import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import SearchInput from '../../../components/ui/SearchInput';
import FilterSelect from '../../../components/ui/FilterSelect';
import Pagination from '../../../components/ui/Pagination';
import { COUPON_STATUS_LABELS, couponStatus, isCouponLive, type Coupon, type Phase, type Brand } from '../../../data/coupons';
import { ActiveSwitch, RemainingBar } from './CouponCells';
import { COUPON_STATUSES } from '../CouponStatusBadge';
import { useCan } from '../CouponRoleContext';
import { useCouponFormat } from '../format';
import { useT } from '@/i18n';

const PAGE_SIZE = 10;
const ALL = 'All';
const NO_PHASE = 'Not in a campaign';

interface CouponListProps {
  coupons: Coupon[];
  brands: Brand[];
  phases: Phase[];
  loadState: 'loading' | 'error' | 'ready';
  actionError: string;
  onRetry: () => void;
  onCreate: () => void;
  onOpen: (c: Coupon) => void;
  onOpenBrand: (s: Brand) => void;
  onSetActive: (c: Coupon, isActive: boolean) => void;
  onSetActiveMany: (ids: string[], isActive: boolean) => void;
}

// Coupon list: search, filters, bulk on/off, table (cards on phones).
export default function CouponList(props: CouponListProps) {
  const { coupons, brands, phases, loadState, actionError, onRetry, onCreate, onOpen, onOpenBrand, onSetActive, onSetActiveMany } = props;
  const t = useT();
  const fmt = useCouponFormat();
  const canEdit = useCan('coupon.write');
  const [search, setSearch] = useState('');
  const [phaseName, setPhaseName] = useState(ALL);
  const [brandName, setBrandName] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const brandById = useMemo(() => new Map(brands.map((s) => [s.id, s])), [brands]);
  const phaseById = useMemo(() => new Map(phases.map((p) => [p.id, p])), [phases]);
  const phaseOf = (c: Coupon) => (c.phaseId ? phaseById.get(c.phaseId) : undefined);
  const statusOptions = [ALL, ...COUPON_STATUSES.map((s) => COUPON_STATUS_LABELS[s])];

  const term = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      coupons.filter((c) => {
        const brand = brandById.get(c.brandId);
        return (
          (!term || `${c.title} ${brand?.name ?? ''}`.toLowerCase().includes(term)) &&
          (phaseName === ALL || (phaseName === NO_PHASE ? !c.phaseId : phaseOf(c)?.name === phaseName)) &&
          (brandName === ALL || brand?.name === brandName) &&
          (status === ALL || COUPON_STATUS_LABELS[couponStatus(c, phases)] === status)
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coupons, brandById, phaseById, term, phaseName, brandName, status],
  );
  const filtered = Boolean(term) || phaseName !== ALL || brandName !== ALL || status !== ALL;
  const clearFilters = () => {
    setSearch('');
    setPhaseName(ALL);
    setBrandName(ALL);
    setStatus(ALL);
  };

  useEffect(() => setPage(1), [term, phaseName, brandName, status]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const liveCount = coupons.filter((c) => isCouponLive(c, phases)).length;

  // Selection only keeps coupons that still exist.
  const selectedIds = coupons.filter((c) => selected.has(c.id)).map((c) => c.id);
  const pageAllSelected = rows.length > 0 && rows.every((c) => selected.has(c.id));
  const pageSomeSelected = rows.some((c) => selected.has(c.id));
  const toggleRow = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const togglePage = () =>
    setSelected((s) => {
      const next = new Set(s);
      rows.forEach((c) => (pageAllSelected ? next.delete(c.id) : next.add(c.id)));
      return next;
    });
  const bulk = (isActive: boolean) => {
    onSetActiveMany(selectedIds, isActive);
    setSelected(new Set());
  };

  const filterLabel = (v: string) => (v === ALL ? t('All') : t(v));
  const fromLabel = (options: string[], label: string) => options.find((o) => filterLabel(o) === label) ?? ALL;
  const phaseOptions = [ALL, ...phases.map((p) => p.name), NO_PHASE];
  const brandOptions = [ALL, ...[...brands].sort((a, b) => a.name.localeCompare(b.name, 'th')).map((s) => s.name)];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
        <PageHeader
          title={t('Coupon list')}
          icon="solar:ticket-sale-linear"
          description={t('Partner restaurant coupons. Create a coupon here, then add it to a campaign on the Campaigns page.')}
          actions={
            canEdit && (
              <Button pill icon="solar:add-linear" onClick={onCreate} className="whitespace-nowrap flex-1 sm:flex-none">
                {t('Create coupon')}
              </Button>
            )
          }
        />

        {loadState === 'ready' && coupons.length > 0 && (
          <p className="mt-4 text-sm text-[#6B7280]">
            {(() => {
              const [before, after] = t('{live} of {total} coupons can be claimed in the app now', { total: coupons.length }).split('{live}');
              return (
                <>
                  {before}
                  <span className="font-semibold text-[#1A1A1A]">{liveCount}</span>
                  {after}
                </>
              );
            })()}
          </p>
        )}

        {/* Search + filters */}
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder={t('Search title or partner')} className="w-full lg:w-64 flex-shrink-0" />
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterSelect label={t('Campaign')} value={filterLabel(phaseName)} options={phaseOptions.map(filterLabel)} onChange={(v) => setPhaseName(fromLabel(phaseOptions, v))} />
            <FilterSelect label={t('Partner')} value={filterLabel(brandName)} options={brandOptions.map(filterLabel)} onChange={(v) => setBrandName(fromLabel(brandOptions, v))} />
            <FilterSelect label={t('Status')} value={filterLabel(status)} options={statusOptions.map(filterLabel)} onChange={(v) => setStatus(fromLabel(statusOptions, v))} />
            {filtered && (
              <button type="button" onClick={clearFilters} className="h-8 px-2 text-xs text-[#6B7280] underline underline-offset-2 hover:text-[#FF6115]">
                {t('Clear all')}
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

        {canEdit && selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-[#FFF5EF] border border-[#FFB38F] px-4 py-2.5">
            <span className="text-sm font-medium text-[#1A1A1A] mr-auto">{t('{count} selected', { count: selectedIds.length })}</span>
            <Button variant="secondary" icon="solar:eye-linear" onClick={() => bulk(true)}>
              {t('Turn on')}
            </Button>
            <Button variant="secondary" icon="solar:eye-closed-linear" onClick={() => bulk(false)}>
              {t('Turn off')}
            </Button>
            <Button variant="ghost" onClick={() => setSelected(new Set())}>
              {t('Clear selection')}
            </Button>
          </div>
        )}

        {loadState === 'loading' ? (
          <LoadingRows />
        ) : loadState === 'error' ? (
          <StateBox icon="solar:cloud-cross-linear" title={t('Couldn’t load coupons')} text={t('Something went wrong while loading. Check your connection and try again.')}>
            <Button variant="secondary" icon="solar:refresh-linear" onClick={onRetry}>
              {t('Retry')}
            </Button>
          </StateBox>
        ) : coupons.length === 0 ? (
          <StateBox icon="solar:ticket-sale-linear" title={t('No coupons yet')} text={t('Create a coupon for a partner. It shows in the app once it’s active.')}>
            {canEdit && (
              <Button icon="solar:add-linear" onClick={onCreate}>
                {t('Create coupon')}
              </Button>
            )}
          </StateBox>
        ) : visible.length === 0 ? (
          <StateBox icon="solar:magnifer-linear" title={t('No coupons match your filters')} text={t('Try a different search or clear the filters.')}>
            <Button variant="secondary" onClick={clearFilters}>
              {t('Clear filters')}
            </Button>
          </StateBox>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block mt-4 overflow-x-auto border-b border-[#E5E7EB]">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                    {canEdit && (
                      <th scope="col" className="w-12 pl-4">
                        <Checkbox checked={pageAllSelected} indeterminate={!pageAllSelected && pageSomeSelected} onChange={togglePage} label={t('Select all on this page')} />
                      </th>
                    )}
                    <th scope="col" className={`h-11 w-[76px] ${canEdit ? 'pr-2' : 'pl-4 pr-2'}`}>
                      <span className="sr-only">{t('Image')}</span>
                    </th>
                    <th scope="col" className="px-4">{t('Title')}</th>
                    <th scope="col" className="px-4">{t('Partner')}</th>
                    <th scope="col" className="px-4">{t('Campaign')}</th>
                    <th scope="col" className="px-4">{t('Remaining / total')}</th>
                    <th scope="col" className="px-4">{t('Expires')}</th>
                    <th scope="col" className="px-4 pr-4">{t('Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {rows.map((c) => {
                    const brand = brandById.get(c.brandId);
                    return (
                      <tr key={c.id} className={`transition-colors ${selected.has(c.id) ? 'bg-[#FFFAF7]' : 'hover:bg-[#FAFAFA]'}`}>
                        {canEdit && (
                          <td className="pl-4">
                            <Checkbox checked={selected.has(c.id)} onChange={() => toggleRow(c.id)} label={t('Select {name}', { name: c.title })} />
                          </td>
                        )}
                        <td className={`py-3 ${canEdit ? 'pr-2' : 'pl-4 pr-2'}`}>
                          <img src={c.couponImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover bg-[#F3F4F6]" />
                        </td>
                        <td className="px-4 max-w-[260px]">
                          <button type="button" onClick={() => onOpen(c)} className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline break-words">
                            {c.title}
                          </button>
                        </td>
                        <td className="px-4">{brand && <BrandChip brand={brand} onClick={() => onOpenBrand(brand)} />}</td>
                        <td className="px-4 text-[13px] text-[#374151] min-w-[150px] max-w-[200px]">{phaseOf(c)?.name ?? <span className="text-[#9CA3AF]">{t(NO_PHASE)}</span>}</td>
                        <td className="px-4">
                          <RemainingBar coupon={c} />
                        </td>
                        <td className={`px-4 text-[13px] whitespace-nowrap ${couponStatus(c, phases) === 'expired' ? 'text-[#B45309]' : 'text-[#374151]'}`}>
                          {fmt.date(c.expiresAt)}
                          <span className="block text-xs text-[#9CA3AF]">{fmt.time(c.expiresAt)}</span>
                        </td>
                        <td className="px-4 pr-4">
                          <ActiveSwitch coupon={c} phases={phases} onChange={(on) => onSetActive(c, on)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="md:hidden mt-4 space-y-3">
              {rows.map((c) => {
                const brand = brandById.get(c.brandId);
                return (
                  <li key={c.id} className={`rounded-xl border p-3 ${selected.has(c.id) ? 'border-[#FFB38F] bg-[#FFFAF7]' : 'border-[#E5E7EB]'}`}>
                    <div className="flex items-start gap-3">
                      {canEdit && (
                        <div className="pt-1">
                          <Checkbox checked={selected.has(c.id)} onChange={() => toggleRow(c.id)} label={t('Select {name}', { name: c.title })} />
                        </div>
                      )}
                      <img src={c.couponImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-[#F3F4F6] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <button type="button" onClick={() => onOpen(c)} className="text-left text-sm font-semibold text-[#1A1A1A] hover:text-[#FF6115] break-words">
                          {c.title}
                        </button>
                        <div className="mt-1">{brand && <BrandChip brand={brand} onClick={() => onOpenBrand(brand)} />}</div>
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs items-center">
                      <dt className="text-[#9CA3AF]">{t('Campaign')}</dt>
                      <dd className="text-[#374151] min-w-0 truncate">{phaseOf(c)?.name ?? t(NO_PHASE)}</dd>
                      <dt className="text-[#9CA3AF]">{t('Remaining')}</dt>
                      <dd>
                        <RemainingBar coupon={c} />
                      </dd>
                      <dt className="text-[#9CA3AF]">{t('Expires')}</dt>
                      <dd className="text-[#374151]">{fmt.dateTime(c.expiresAt)}</dd>
                      <dt className="text-[#9CA3AF]">{t('Status')}</dt>
                      <dd>
                        <ActiveSwitch coupon={c} phases={phases} onChange={(on) => onSetActive(c, on)} />
                      </dd>
                    </dl>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BrandChip({ brand, onClick }: { brand: Brand; onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      title={t('Open partner page')}
      className="inline-flex items-center gap-2 max-w-[200px] rounded-md text-left text-[13px] text-[#374151] hover:text-[#FF6115] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
    >
      <img src={brand.logoUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]" />
      <span className="truncate">{brand.name}</span>
    </button>
  );
}

function Checkbox({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="w-4 h-4 accent-[#FF6115] cursor-pointer" />;
}

function LoadingRows() {
  const t = useT();
  return (
    <div role="status" aria-label={t('Loading coupons')} className="mt-4 space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-[#F0F0F0] p-3 animate-pulse">
          <div className="w-14 h-14 rounded-lg bg-[#F3F4F6]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-[#F3F4F6]" />
            <div className="h-3 w-1/4 rounded bg-[#F3F4F6]" />
          </div>
          <div className="hidden sm:block h-5 w-9 rounded-full bg-[#F3F4F6]" />
        </div>
      ))}
    </div>
  );
}

function StateBox({ icon, title, text, children }: { icon: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="mt-4 border border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
        <Icon icon={icon} width={22} height={22} className="text-[#FF6115]" />
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
      <p className="text-sm text-[#6B7280] mt-1 max-w-sm">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
