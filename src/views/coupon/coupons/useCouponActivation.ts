import { useRef, useState } from 'react';
import { activationBlock, type Coupon } from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import type { ToastAction } from '../CouponApp';
import { useT } from '@/i18n';

/**
 * The Active switch, one or many: flips first, then saves; puts it back (and says why) if saving
 * fails; offers Undo except where it couldn't work (an expired or sold-out coupon can't come back on).
 * Shared by the Coupon list and a brand's Coupons tab.
 */
export function useCouponActivation(coupons: Coupon[], setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>, onToast: (message: string, action?: ToastAction) => void) {
  const t = useT();
  const [actionError, setActionError] = useState('');
  // Undo runs after later renders, so read the newest list.
  const latest = useRef(coupons);
  latest.current = coupons;

  const setActive = async (ids: string[], isActive: boolean) => {
    const before = new Map(latest.current.filter((c) => ids.includes(c.id)).map((c) => [c.id, c.isActive]));
    setCoupons((list) => list.map((c) => (before.has(c.id) ? { ...c, isActive } : c)));
    setActionError('');
    try {
      const saved = ids.length === 1 ? [await couponApi.coupons.setActive(ids[0], isActive)] : await couponApi.coupons.setActiveMany(ids, isActive);
      const byId = new Map(saved.map((c) => [c.id, c]));
      setCoupons((list) => list.map((c) => byId.get(c.id) ?? c));
      return true;
    } catch (e) {
      setCoupons((list) => list.map((c) => (before.has(c.id) ? { ...c, isActive: before.get(c.id)! } : c)));
      setActionError(e instanceof CouponApiError ? e.message : t('Couldn’t change the coupon status. Check your connection and try again.'));
      return false;
    }
  };

  const undo = (ids: string[], wasActive: boolean): ToastAction => ({
    label: t('Undo'),
    onClick: async () => {
      if (await setActive(ids, wasActive)) onToast(t('Change undone.'));
    },
  });

  const toggleOne = async (c: Coupon, isActive: boolean) => {
    if (!(await setActive([c.id], isActive))) return;
    if (isActive) onToast(t('Coupon turned on'), undo([c.id], false));
    // Expired / sold out can't be turned back on, so there's nothing to undo.
    else if (activationBlock(c)) onToast(t('Coupon turned off. It’s expired or out of stock, so it can’t be turned back on.'));
    else onToast(t('Coupon turned off'), undo([c.id], true));
  };

  const toggleMany = async (ids: string[], isActive: boolean) => {
    const chosen = latest.current.filter((c) => ids.includes(c.id));
    const skipped = isActive ? chosen.filter((c) => !c.isActive && activationBlock(c)).length : 0;
    const changing = chosen.filter((c) => c.isActive !== isActive && !(isActive && activationBlock(c))).map((c) => c.id);
    if (!changing.length) {
      setActionError(
        skipped
          ? t('None of the selected coupons can be turned on — they’re expired or out of stock.')
          : isActive
            ? t('The selected coupons are already on.')
            : t('The selected coupons are already off.'),
      );
      return;
    }
    if (!(await setActive(changing, isActive))) return;
    const done = isActive ? t('{count} coupons turned on', { count: changing.length }) : t('{count} coupons turned off', { count: changing.length });
    // Undo only what can go back: expired / sold-out coupons that were turned off stay off.
    const undoable = isActive ? changing : changing.filter((id) => !activationBlock(chosen.find((c) => c.id === id)!));
    onToast(skipped ? `${done} · ${t('{count} skipped (expired or out of stock)', { count: skipped })}` : done, undoable.length ? undo(undoable, !isActive) : undefined);
  };

  return { actionError, setActionError, toggleOne, toggleMany };
}
