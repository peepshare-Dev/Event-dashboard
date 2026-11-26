import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import { claimLimit, type Coupon, type Phase } from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import { useCouponFormat } from '../format';
import { useT } from '@/i18n';

interface QuantityModalProps {
  coupon: Coupon;
  phase: Phase;
  onClose: () => void;
  onSaved: (coupon: Coupon) => void;
}

// How many of a coupon users can claim in its phase: at least what's been claimed, at most its total quantity.
export default function QuantityModal({ coupon, phase, onClose, onSaved }: QuantityModalProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const [value, setValue] = useState(String(claimLimit(coupon)));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const min = Math.max(1, coupon.claimedCount);

  const save = async () => {
    const n = Number(value);
    if (!value.trim() || !Number.isInteger(n) || n < min || n > coupon.totalQuantity) {
      setError(t('Enter a whole number from {min} to {max}.', { min, max: coupon.totalQuantity }));
      return;
    }
    setSaving(true);
    setError('');
    try {
      onSaved(await couponApi.phases.setCouponQuantity(coupon.id, n));
    } catch (e) {
      setError(e instanceof CouponApiError ? e.message : t('Couldn’t save the quantity. Check your connection and try again.'));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t('Usable in {phase}', { phase: phase.name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t('Cancel')}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? t('Saving…') : t('Save quantity')}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-3"
      >
        <p className="text-sm text-[#374151] break-words">{coupon.title}</p>
        <FormField label={t('Usable in this campaign')} required error={error}>
          {(id) => (
            <div>
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min={min}
                max={coupon.totalQuantity}
                step={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={`${id}-help`}
                autoFocus
                className={inputClass(Boolean(error))}
              />
              <p id={`${id}-help`} className="mt-1 text-xs text-[#6B7280]">
                {coupon.claimedCount
                  ? t('{claimed} already claimed · up to {total} (the coupon’s total quantity)', { claimed: fmt.number(coupon.claimedCount), total: fmt.number(coupon.totalQuantity) })
                  : t('Up to {total} (the coupon’s total quantity)', { total: fmt.number(coupon.totalQuantity) })}
              </p>
            </div>
          )}
        </FormField>
      </form>
    </Modal>
  );
}
