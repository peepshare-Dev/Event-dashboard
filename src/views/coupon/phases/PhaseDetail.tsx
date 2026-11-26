import { useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import { claimLimit, couponStatus, phaseDurationDays, remainingStock, type Coupon, type Phase, type Brand } from '../../../data/coupons';
import { couponApi, CouponApiError, type CouponAllocation } from '../../../data/mock/couponApi';
import CouponStatusBadge from '../CouponStatusBadge';
import { useCan } from '../CouponRoleContext';
import { couponsAcrossBrands, useCouponFormat } from '../format';
import PhaseStatusBadge from './PhaseStatusBadge';
import { StateBox } from './PhaseList';
import { phaseStats } from './stats';
import QuantityModal from './QuantityModal';
import CouponPickerModal from './CouponPickerModal';
import { useT } from '@/i18n';

interface PhaseDetailProps {
  phase: Phase;
  /** This phase's coupons. */
  coupons: Coupon[];
  /** The whole coupon list, to pick from. */
  allCoupons: Coupon[];
  /** Every phase, to name the one a coupon is already in. */
  phases: Phase[];
  brands: Brand[];
  /** Just created: offer the "Add coupons" next step. */
  justCreated: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  /** Coupons added to or taken out of the phase. */
  onCouponsChange: (changed: Coupon[]) => void;
  onOpenCoupon: (id: string) => void;
  onToast: (message: string) => void;
}

// One phase: dates and status, totals, and its coupons grouped by brand.
export default function PhaseDetail({ phase, coupons, allCoupons, phases, brands, justCreated, onBack, onEdit, onDeleted, onCouponsChange, onOpenCoupon, onToast }: PhaseDetailProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const canEdit = useCan('phase.write');
  const [removing, setRemoving] = useState<Coupon | null>(null);
  const [resizing, setResizing] = useState<Coupon | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const s = phaseStats(coupons);
  const days = phaseDurationDays(phase.startDate, phase.endDate);
  const deleteBlocked = s.claimed > 0;

  const groups = brands
    .map((brand) => ({ brand, coupons: coupons.filter((c) => c.brandId === brand.id).sort((a, b) => a.title.localeCompare(b.title, 'th')) }))
    .filter((g) => g.coupons.length)
    .sort((a, b) => a.brand.name.localeCompare(b.brand.name, 'th'));

  const onAddCoupons = () => setAdding(true);

  // Saves the phase's whole coupon set as picked in the modal.
  const saveCoupons = async (all: CouponAllocation[]) => {
    try {
      await couponApi.phases.save({ id: phase.id, name: phase.name, startDate: phase.startDate, endDate: phase.endDate }, all);
    } catch (e) {
      throw new Error(e instanceof CouponApiError ? e.message : t('Couldn’t save the coupons. Check your connection and try again.'));
    }
    setAdding(false);
    onCouponsChange([]);
    onToast(t('Coupons in {phase} saved.', { phase: phase.name }));
  };

  const takeOut = async (c: Coupon) => {
    setRemoving(null);
    setError('');
    try {
      onCouponsChange([await couponApi.phases.removeCoupon(c.id)]);
      onToast(t('“{name}” removed from {phase}.', { name: c.title, phase: phase.name }));
    } catch (e) {
      setError(e instanceof CouponApiError ? e.message : t('Couldn’t remove the coupon. Check your connection and try again.'));
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    setError('');
    try {
      await couponApi.phases.remove(phase.id);
      onDeleted();
    } catch (e) {
      setError(e instanceof CouponApiError ? e.message : t('Couldn’t delete the campaign. Check your connection and try again.'));
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 h-8 -ml-1 px-1 text-sm text-[#6B7280] rounded-md hover:text-[#FF6115] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
      >
        <Icon icon="solar:arrow-left-linear" width={16} height={16} />
        {t('Back to {page}', { page: t('Campaigns') })}
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-[#1A1A1A] leading-tight break-words">{phase.name}</h1>
              <PhaseStatusBadge status={phase.status} />
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#6B7280]">
              <Icon icon="solar:calendar-linear" width={16} height={16} className="flex-shrink-0" />
              {fmt.dateTime(phase.startDate)} – {fmt.dateTime(phase.endDate)} · {days === 1 ? t('1 day') : t('{count} days', { count: fmt.number(days) })}
            </p>
          </div>
          {canEdit && (
            <div className="flex flex-col items-stretch sm:items-end gap-1.5 flex-shrink-0">
              <div className="flex gap-2">
                <Button variant="secondary" pill icon="solar:pen-new-square-linear" onClick={onEdit} disabled={deleting}>
                  {t('Edit')}
                </Button>
                {/* Wrapper carries the tooltip, since disabled buttons don't receive hover events everywhere. */}
                <span title={deleteBlocked ? t('Users have claimed coupons in this campaign, so it can’t be deleted.') : undefined} className="inline-flex">
                  <Button
                    variant="ghost"
                    pill
                    icon="solar:trash-bin-trash-linear"
                    onClick={() => setConfirmDelete(true)}
                    disabled={deleteBlocked || deleting}
                    aria-describedby={deleteBlocked ? `delete-why-${phase.id}` : undefined}
                    className="text-[#DC2626] hover:bg-[#FEF2F2]"
                  >
                    {deleting ? t('Deleting…') : t('Delete')}
                  </Button>
                </span>
              </div>
              {deleteBlocked && (
                <p id={`delete-why-${phase.id}`} className="text-xs text-[#6B7280] sm:text-right max-w-[300px]">
                  {t('Can’t delete: users have claimed {count} coupons in this campaign. Turn its coupons off instead.', { count: fmt.number(s.claimed) })}
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
            {error}
          </p>
        )}

        {justCreated && canEdit && coupons.length === 0 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[#16A34A]/30 bg-[#F0FDF4] px-4 py-3">
            <Icon icon="solar:check-circle-linear" width={20} height={20} className="text-[#15803D] flex-shrink-0" />
            <p className="flex-1 text-sm text-[#15803D]">{t('Campaign created. Next, add coupons to it — it stays a draft until it has some.')}</p>
            <Button icon="solar:add-linear" onClick={onAddCoupons} className="whitespace-nowrap">
              {t('Add coupons to this campaign')}
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      <section aria-label={t('Campaign summary')} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <Tile label={t('Partners')} value={fmt.number(s.brandCount)} />
        <Tile label={t('Total coupons')} value={fmt.number(s.total)} />
        <Tile label={t('Claimed')} value={fmt.number(s.claimed)} />
        <Tile label={t('Redeemed')} value={fmt.number(s.redeemed)} />
        <Tile label={t('Remaining')} value={fmt.number(s.remaining)} />
      </section>

      {/* Coupons by brand */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">{t('Coupons in this campaign')}</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">{couponsAcrossBrands(t, s.couponCount, s.brandCount)}</p>
          </div>
          {canEdit && coupons.length > 0 && (
            <Button variant="secondary" pill icon="solar:add-linear" onClick={onAddCoupons} className="whitespace-nowrap">
              {t('Add coupons')}
            </Button>
          )}
        </div>

        {coupons.length === 0 ? (
          <StateBox icon="solar:ticket-sale-linear" title={t('No coupons in this campaign yet')} text={t('Add coupons you’ve created on the Coupon list. The campaign shows as Draft until it has at least one.')}>
            {canEdit && (
              <Button icon="solar:add-linear" onClick={onAddCoupons}>
                {t('Add coupons to this campaign')}
              </Button>
            )}
          </StateBox>
        ) : (
          <div className="mt-4 overflow-x-auto border-b border-[#E5E7EB]">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                  <th scope="col" className="h-11 pl-4 px-3">{t('Coupon')}</th>
                  <th scope="col" className="px-3">{t('Status')}</th>
                  <th scope="col" className="px-3 text-right">{t('Claimed / usable')}</th>
                  <th scope="col" className="px-3 text-right">{t('Redeemed')}</th>
                  <th scope="col" className="px-3 text-right">{t('Remaining')}</th>
                  <th scope="col" className={`px-3 ${canEdit ? '' : 'pr-4'}`}>{t('Expires')}</th>
                  {canEdit && (
                    <th scope="col" className="px-3 pr-4">
                      <span className="sr-only">{t('Actions')}</span>
                    </th>
                  )}
                </tr>
              </thead>
              {groups.map(({ brand, coupons: own }) => {
                const g = phaseStats(own);
                return (
                  <tbody key={brand.id} className="text-[13px] text-[#374151]">
                    <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
                      <th scope="rowgroup" colSpan={canEdit ? 7 : 6} className="pl-4 px-3 py-2.5 text-left font-normal">
                        <span className="inline-flex items-center gap-2.5">
                          <img src={brand.logoUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-[#E5E7EB]" />
                          <span className="text-sm font-semibold text-[#1A1A1A]">{brand.name}</span>
                          <span className="text-xs text-[#6B7280]">
                            {own.length === 1 ? t('1 coupon') : t('{count} coupons', { count: own.length })} · {t('{claimed} of {total} claimed', { claimed: fmt.number(g.claimed), total: fmt.number(g.total) })}
                          </span>
                        </span>
                      </th>
                    </tr>
                    {own.map((c) => (
                      <tr key={c.id} className="border-t border-[#F0F0F0] hover:bg-[#FAFAFA]">
                        <td className="pl-8 px-3 py-3 max-w-[300px]">
                          <button type="button" onClick={() => onOpenCoupon(c.id)} className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline break-words">
                            {c.title}
                          </button>
                        </td>
                        <td className="px-3">
                          <CouponStatusBadge status={couponStatus(c, [phase])} />
                        </td>
                        <td className="px-3 text-right tabular-nums whitespace-nowrap">
                          {fmt.number(c.claimedCount)} <span className="text-[#9CA3AF]">/ {fmt.number(claimLimit(c))}</span>
                        </td>
                        <td className="px-3 text-right tabular-nums">{fmt.number(c.redeemedCount)}</td>
                        <td className="px-3 text-right tabular-nums">{fmt.number(remainingStock(c))}</td>
                        <td className={`px-3 whitespace-nowrap ${canEdit ? '' : 'pr-4'}`}>{fmt.dateTime(c.expiresAt)}</td>
                        {canEdit && (
                          <td className="px-3 pr-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setResizing(c)}
                              aria-label={t('Change how many of {name} can be claimed', { name: c.title })}
                              title={t('Change quantity')}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                            >
                              <Icon icon="solar:pen-linear" width={18} height={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRemoving(c)}
                              disabled={c.claimedCount > 0}
                              title={c.claimedCount > 0 ? t('Users have claimed this coupon, so it stays in the campaign. Turn it off instead.') : undefined}
                              aria-label={t('Remove {name} from this campaign', { name: c.title })}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#DC2626] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#6B7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                            >
                              <Icon icon="solar:minus-circle-linear" width={18} height={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                );
              })}
            </table>
          </div>
        )}
      </section>

      {adding && (
        <CouponPickerModal
          phaseName={phase.name}
          phaseId={phase.id}
          startDate={phase.startDate}
          coupons={allCoupons}
          brands={brands}
          phases={phases}
          value={coupons.map((c) => ({ couponId: c.id, quantity: claimLimit(c) }))}
          confirmLabel={t('Save coupons')}
          onClose={() => setAdding(false)}
          onSave={saveCoupons}
        />
      )}

      {resizing && (
        <QuantityModal
          coupon={resizing}
          phase={phase}
          onClose={() => setResizing(null)}
          onSaved={(saved) => {
            setResizing(null);
            onCouponsChange([saved]);
            onToast(t('“{name}”: {count} usable in {phase}.', { name: saved.title, count: fmt.number(claimLimit(saved)), phase: phase.name }));
          }}
        />
      )}

      {removing && (
        <DeleteConfirmationModal
          title={t('Remove from campaign?')}
          confirmLabel={t('Remove')}
          message={t('“{name}” will leave {phase} and stop showing in the app. The coupon itself is kept on the Coupon list.', { name: removing.title, phase: phase.name })}
          onConfirm={() => takeOut(removing)}
          onClose={() => setRemoving(null)}
        />
      )}

      {confirmDelete && (
        <DeleteConfirmationModal
          title={t('Delete campaign?')}
          message={
            coupons.length
              ? t('“{name}” will be deleted. Its {count} coupons are kept on the Coupon list, out of any campaign. This can’t be undone.', { name: phase.name, count: coupons.length })
              : t('“{name}” will be deleted. This can’t be undone.', { name: phase.name })
          }
          onConfirm={remove}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4">
      <p className="text-xs font-medium text-[#6B7280]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1A1A1A] leading-tight">{value}</p>
    </div>
  );
}
