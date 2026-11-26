import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import SearchInput from '../../../components/ui/SearchInput';
import FilterSelect from '../../../components/ui/FilterSelect';
import { BRAND_PARTNER_STATUS_LABELS, brandPartnerStatus, claimLimit, type Brand, type Coupon, type CouponUser, type Phase } from '../../../data/coupons';
import { useCan } from '../CouponRoleContext';
import { toLocalParts, useCouponFormat } from '../format';
import { downloadCsv, toCsv } from '../dashboard/metrics';
import { partnerStats } from './partnerExport';
import { StateBox } from '../phases/PhaseList';
import BrandPartnerBadge, { BRAND_PARTNER_STATUSES } from './BrandPartnerBadge';
import { useT } from '@/i18n';

const ALL = 'All';
const NO_OWNER = 'No owner';

interface BrandListProps {
  brands: Brand[];
  coupons: Coupon[];
  phases: Phase[];
  bdUsers: CouponUser[];
  loadState: 'loading' | 'error' | 'ready';
  onRetry: () => void;
  onAdd: () => void;
  onOpen: (b: Brand) => void;
}

/** Partner period as text, e.g. "1 Jan 2026 – 31 Dec 2026", "From 1 Jan 2026" or "Until …". */
export function usePartnerPeriod() {
  const t = useT();
  const fmt = useCouponFormat();
  return (b: Pick<Brand, 'partnerStartDate' | 'partnerEndDate'>) =>
    b.partnerStartDate && b.partnerEndDate
      ? `${fmt.date(b.partnerStartDate)} – ${fmt.date(b.partnerEndDate)}`
      : b.partnerStartDate
        ? t('From {date}', { date: fmt.date(b.partnerStartDate) })
        : b.partnerEndDate
          ? t('Until {date}', { date: fmt.date(b.partnerEndDate) })
          : '—';
}

// Partners > All partners: partner status, contract period, coupons and owner at a glance. Click one to edit it.
// The page header and tabs are in BrandsPage.
export default function BrandList({ brands, coupons, phases, bdUsers, loadState, onRetry, onAdd, onOpen }: BrandListProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const period = usePartnerPeriod();
  const canEdit = useCan('brand.write');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(ALL);
  const [phaseName, setPhaseName] = useState(ALL);
  const [owner, setOwner] = useState(ALL);

  const ownerName = (id?: string) => bdUsers.find((u) => u.id === id)?.name;
  const term = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      brands
        .filter((b) => {
          const phase = phases.find((p) => p.name === phaseName);
          return (
            (!term || b.name.toLowerCase().includes(term)) &&
            (status === ALL || BRAND_PARTNER_STATUS_LABELS[brandPartnerStatus(b)] === status) &&
            (!phase || coupons.some((c) => c.brandId === b.id && c.phaseId === phase.id)) &&
            (owner === ALL || (owner === NO_OWNER ? !ownerName(b.ownerBdId) : ownerName(b.ownerBdId) === owner))
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'th')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brands, coupons, phases, bdUsers, term, status, phaseName, owner],
  );
  const filtered = Boolean(term) || status !== ALL || phaseName !== ALL || owner !== ALL;
  const clearFilters = () => {
    setSearch('');
    setStatus(ALL);
    setPhaseName(ALL);
    setOwner(ALL);
  };

  // FilterSelect shows translated labels; map them back to values.
  const label = (v: string) => t(v);
  const statusOptions = [ALL, ...BRAND_PARTNER_STATUSES.map((s) => BRAND_PARTNER_STATUS_LABELS[s])];
  const phaseOptions = [ALL, ...phases.map((p) => p.name)];
  const ownerOptions = [ALL, ...bdUsers.map((u) => u.name), NO_OWNER];
  const fromLabel = (options: string[], l: string) => options.find((o) => label(o) === l) ?? ALL;

  // One row per partner shown (filters apply), every phase, for reporting to partners.
  const exportPartners = (list: Brand[]) => {
    const csv = toCsv(
      ['Partner', 'Partner status', 'Partner period', 'Owner BD', 'Coupons', 'Total quantity', 'Views', 'Unique viewers', 'Claimed', 'Redeemed', 'Redemption rate (%)', 'Remaining'],
      list.map((b) => {
        const s = partnerStats(coupons.filter((c) => c.brandId === b.id));
        return [b.name, BRAND_PARTNER_STATUS_LABELS[brandPartnerStatus(b)], period(b), ownerName(b.ownerBdId) ?? '', s.count, s.total, s.views, s.viewers, s.claimed, s.redeemed, s.ratePct, s.remaining];
      }),
    );
    downloadCsv(`partners_${toLocalParts(new Date().toISOString()).date}.csv`, csv);
  };

  const totals = (b: Brand) => {
    const own = coupons.filter((c) => c.brandId === b.id);
    return { count: own.length, claimed: own.reduce((s, c) => s + c.claimedCount, 0), total: own.reduce((s, c) => s + claimLimit(c), 0) };
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t('Search partner name')} className="w-full lg:w-64 flex-shrink-0" />
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterSelect label={t('Partner status')} value={label(status)} options={statusOptions.map(label)} onChange={(v) => setStatus(fromLabel(statusOptions, v))} />
          <FilterSelect label={t('Campaign')} value={label(phaseName)} options={phaseOptions.map(label)} onChange={(v) => setPhaseName(fromLabel(phaseOptions, v))} />
          <FilterSelect label={t('Owner BD')} value={label(owner)} options={ownerOptions.map(label)} onChange={(v) => setOwner(fromLabel(ownerOptions, v))} />
          {filtered && (
            <button type="button" onClick={clearFilters} className="h-8 px-2 text-xs text-[#6B7280] underline underline-offset-2 hover:text-[#FF6115]">
              {t('Clear all')}
            </button>
          )}
        </div>
        <Button
          variant="secondary"
          pill
          icon="solar:download-minimalistic-linear"
          onClick={() => exportPartners(visible)}
          disabled={loadState !== 'ready' || !visible.length}
          className="lg:ml-auto whitespace-nowrap"
        >
          {t('Export CSV')}
        </Button>
      </div>

      {loadState === 'loading' ? (
        <div role="status" aria-label={t('Loading partners')} className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-[#F0F0F0] bg-[#F9FAFB] animate-pulse" />
          ))}
        </div>
      ) : loadState === 'error' ? (
        <StateBox icon="solar:cloud-cross-linear" title={t('Couldn’t load partners')} text={t('Something went wrong while loading. Check your connection and try again.')}>
          <Button variant="secondary" icon="solar:refresh-linear" onClick={onRetry}>
            {t('Retry')}
          </Button>
        </StateBox>
      ) : brands.length === 0 ? (
        <StateBox icon="solar:shop-linear" title={t('No partners yet')} text={t('Add a partner, then create coupons for it.')}>
          {canEdit && (
            <Button icon="solar:add-linear" onClick={onAdd}>
              {t('Add partner')}
            </Button>
          )}
        </StateBox>
      ) : visible.length === 0 ? (
        <StateBox icon="solar:magnifer-linear" title={t('No partners match your filters')} text={t('Try a different search or clear the filters.')}>
          <Button variant="secondary" onClick={clearFilters}>
            {t('Clear filters')}
          </Button>
        </StateBox>
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <div className="hidden md:block mt-4 overflow-x-auto border-b border-[#E5E7EB]">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                  <th scope="col" className="h-11 pl-4 pr-2 w-[64px]">
                    <span className="sr-only">{t('Logo')}</span>
                  </th>
                  <th scope="col" className="px-3">{t('Partner')}</th>
                  <th scope="col" className="px-3">{t('Partner status')}</th>
                  <th scope="col" className="px-3">{t('Partner period')}</th>
                  <th scope="col" className="px-3 text-right">{t('Coupons')}</th>
                  <th scope="col" className="px-3">{t('Claimed / total')}</th>
                  <th scope="col" className="px-3 pr-4">{t('Owner BD')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0] text-[13px] text-[#374151]">
                {visible.map((b) => {
                  const n = totals(b);
                  return (
                    <tr key={b.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="pl-4 pr-2 py-3">
                        <img src={b.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]" />
                      </td>
                      <td className="px-3">
                        <button type="button" onClick={() => onOpen(b)} className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline">
                          {b.name}
                        </button>
                      </td>
                      <td className="px-3">
                        <BrandPartnerBadge status={brandPartnerStatus(b)} />
                      </td>
                      <td className="px-3 whitespace-nowrap">{period(b)}</td>
                      <td className="px-3 text-right tabular-nums">{fmt.number(n.count)}</td>
                      <td className="px-3 tabular-nums whitespace-nowrap">
                        <span className="font-medium text-[#1A1A1A]">{fmt.number(n.claimed)}</span> / {fmt.number(n.total)}
                      </td>
                      <td className="px-3 pr-4">{ownerName(b.ownerBdId) ?? <span className="text-[#9CA3AF]">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden mt-4 space-y-3">
            {visible.map((b) => {
              const n = totals(b);
              return (
                <li key={b.id} className="rounded-xl border border-[#E5E7EB] p-4">
                  <div className="flex items-center gap-3">
                    <img src={b.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB] flex-shrink-0" />
                    <button type="button" onClick={() => onOpen(b)} className="flex-1 min-w-0 text-left text-sm font-semibold text-[#1A1A1A] hover:text-[#FF6115] truncate">
                      {b.name}
                    </button>
                    <BrandPartnerBadge status={brandPartnerStatus(b)} />
                  </div>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                    <dt className="text-[#9CA3AF]">{t('Partner period')}</dt>
                    <dd className="text-[#374151]">{period(b)}</dd>
                    <dt className="text-[#9CA3AF]">{t('Coupons')}</dt>
                    <dd className="text-[#374151]">
                      {fmt.number(n.count)} · {t('{claimed} of {total} claimed', { claimed: fmt.number(n.claimed), total: fmt.number(n.total) })}
                    </dd>
                    <dt className="text-[#9CA3AF]">{t('Owner BD')}</dt>
                    <dd className="text-[#374151]">{ownerName(b.ownerBdId) ?? '—'}</dd>
                  </dl>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Icon icon="solar:info-circle-linear" width={14} height={14} />
            {t('Coupons and claims count every campaign.')}
          </p>
        </>
      )}
    </div>
  );
}
