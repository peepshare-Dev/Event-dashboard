import { useCallback, useEffect, useRef, useState } from 'react';
import CouponList from './CouponList';
import CouponForm from './CouponForm';
import { useCouponActivation } from './useCouponActivation';
import type { Brand, Coupon, Phase } from '../../../data/coupons';
import { couponApi } from '../../../data/mock/couponApi';
import type { ToastAction } from '../CouponApp';
import { useT } from '@/i18n';

type Screen = { kind: 'list' } | { kind: 'form'; id: string | null };

interface CouponManagerProps {
  onToast: (message: string, action?: ToastAction) => void;
  /** Lets the app guard navigation away from an unsaved form. */
  onDirtyChange: (dirty: boolean) => void;
  /** Opens a brand's page (Brands menu). */
  onOpenBrand: (brandId: string) => void;
  /** Open this coupon's form straight away (e.g. from the dashboard). */
  initialCouponId?: string;
  /** Open a new coupon form with this brand selected (e.g. from a brand page). */
  initialCreateBrandId?: string;
}

// "Coupon list": list ⇄ create / edit form.
export default function CouponManager({ onToast, onDirtyChange, onOpenBrand, initialCouponId, initialCreateBrandId }: CouponManagerProps) {
  const t = useT();
  const creating = Boolean(initialCreateBrandId);
  const [screen, setScreen] = useState<Screen>(initialCouponId || creating ? { kind: 'form', id: initialCouponId ?? null } : { kind: 'list' });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const { actionError, setActionError, toggleOne, toggleMany } = useCouponActivation(coupons, setCoupons, onToast);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setLoadState('loading');
    Promise.all([couponApi.coupons.list(), couponApi.brands.list(), couponApi.phases.list()])
      .then(([c, b, p]) => {
        setCoupons(c);
        setBrands(b);
        setPhases(p);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, []);

  useEffect(load, [load]);

  const go = (next: Screen) => {
    setScreen(next);
    setActionError('');
    rootRef.current?.closest('main')?.scrollTo(0, 0);
  };

  const saveBrand = (brand: Brand) => setBrands((list) => (list.some((b) => b.id === brand.id) ? list.map((b) => (b.id === brand.id ? brand : b)) : [...list, brand]));

  const editing = screen.kind === 'form' && screen.id ? coupons.find((c) => c.id === screen.id) : undefined;
  // A coupon that no longer exists falls back to the list.
  const missing = loadState === 'ready' && screen.kind === 'form' && screen.id !== null && !editing;
  useEffect(() => {
    if (missing) setScreen({ kind: 'list' });
  }, [missing]);

  return (
    <div ref={rootRef} className="min-h-full flex flex-col">
      {screen.kind === 'list' && (
        <CouponList
          coupons={coupons}
          brands={brands}
          phases={phases}
          loadState={loadState}
          actionError={actionError}
          onRetry={load}
          onCreate={() => go({ kind: 'form', id: null })}
          onOpen={(c) => go({ kind: 'form', id: c.id })}
          onOpenBrand={(b) => onOpenBrand(b.id)}
          onSetActive={toggleOne}
          onSetActiveMany={toggleMany}
        />
      )}

      {/* A new form waits for the brands, so a pre-selected brand can fill in its default conditions. */}
      {screen.kind === 'form' && (screen.id === null ? loadState === 'ready' : editing) && (
        <CouponForm
          key={screen.id ?? 'new'}
          coupon={editing}
          defaultBrandId={screen.id === null ? initialCreateBrandId : undefined}
          brands={brands}
          phases={phases}
          onBrandSaved={saveBrand}
          onOpenBrand={onOpenBrand}
          onDirtyChange={onDirtyChange}
          onCancel={() => go({ kind: 'list' })}
          onToast={onToast}
          onSaved={(saved, created) => {
            setCoupons((list) => (created ? [saved, ...list] : list.map((c) => (c.id === saved.id ? saved : c))));
            onToast(
              created && !saved.phaseId
                ? t('Coupon created. Add it to a campaign on the Campaigns page to show it in the app.')
                : t('Coupon saved.'),
            );
            go({ kind: 'list' });
          }}
        />
      )}
    </div>
  );
}
