import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Coupon, Phase, Brand } from '../../../data/coupons';
import { couponApi } from '../../../data/mock/couponApi';
import type { ToastAction } from '../CouponApp';
import PhaseList from './PhaseList';
import PhaseDetail from './PhaseDetail';
import PhaseForm from './PhaseForm';
import { phaseStats } from './stats';
import { useT } from '@/i18n';

type Screen =
  | { kind: 'list' }
  | { kind: 'detail'; id: string; justCreated?: boolean }
  /** No id: a new phase. */
  | { kind: 'form'; id?: string };

interface PhasesPageProps {
  onToast: (message: string, action?: ToastAction) => void;
  /** Lets the app guard navigation away from an unsaved phase form. */
  onDirtyChange: (dirty: boolean) => void;
  onOpenCoupon: (couponId: string) => void;
}

// "Campaigns": list ⇄ detail ⇄ create / edit form, each its own page.
export default function PhasesPage({ onToast, onDirtyChange, onOpenCoupon }: PhasesPageProps) {
  const t = useT();
  const [screen, setScreen] = useState<Screen>({ kind: 'list' });
  const [phases, setPhases] = useState<Phase[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const rootRef = useRef<HTMLDivElement>(null);

  /** `quiet` keeps what's on screen while refreshing after a save or delete. */
  const load = useCallback((quiet = false) => {
    if (!quiet) setLoadState('loading');
    return Promise.all([couponApi.phases.list(), couponApi.coupons.list(), couponApi.brands.list()])
      .then(([p, c, s]) => {
        setPhases(p);
        setCoupons(c);
        setBrands(s);
        setLoadState('ready');
      })
      .catch(() => {
        if (!quiet) setLoadState('error');
        else onToast(t('Couldn’t refresh the campaigns. Reload the page to see the latest.'));
      });
  }, [onToast, t]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => new Map(phases.map((p) => [p.id, phaseStats(coupons.filter((c) => c.phaseId === p.id))])), [phases, coupons]);

  const go = (next: Screen) => {
    setScreen(next);
    rootRef.current?.closest('main')?.scrollTo(0, 0);
  };

  const current = screen.kind !== 'list' && screen.id ? phases.find((p) => p.id === screen.id) : undefined;
  // A phase that's gone (e.g. deleted elsewhere) falls back to the list.
  useEffect(() => {
    if (loadState === 'ready' && screen.kind !== 'list' && screen.id && !current) setScreen({ kind: 'list' });
  }, [loadState, screen, current]);

  return (
    <div ref={rootRef} className="min-h-full flex flex-col">
      {screen.kind === 'form' && (loadState === 'ready' || !screen.id) ? (
        <PhaseForm
          phase={current}
          phases={phases}
          coupons={coupons}
          brands={brands}
          onDirtyChange={onDirtyChange}
          onCancel={() => go(current ? { kind: 'detail', id: current.id } : { kind: 'list' })}
          onSaved={(saved, created, couponCount) => {
            setPhases((list) => (created ? [...list, saved] : list.map((p) => (p.id === saved.id ? saved : p))));
            onToast(
              !created
                ? t('Campaign saved.')
                : couponCount === 0
                  ? t('Campaign created.')
                  : couponCount === 1
                    ? t('Campaign created with 1 coupon.')
                    : t('Campaign created with {count} coupons.', { count: couponCount }),
            );
            go({ kind: 'detail', id: saved.id, justCreated: created });
            // Coupons moved in or out, and status (Draft until it has coupons) is derived by the server.
            load(true);
          }}
        />
      ) : screen.kind === 'detail' && current ? (
        <PhaseDetail
          phase={current}
          coupons={coupons.filter((c) => c.phaseId === current.id)}
          allCoupons={coupons}
          phases={phases}
          brands={brands}
          justCreated={Boolean(screen.justCreated)}
          onBack={() => go({ kind: 'list' })}
          onEdit={() => go({ kind: 'form', id: current.id })}
          onDeleted={() => {
            onToast(t('Campaign deleted.'));
            go({ kind: 'list' });
            load(true);
          }}
          onCouponsChange={(changed) => {
            setCoupons((list) => list.map((c) => changed.find((x) => x.id === c.id) ?? c));
            // Status (Draft until it has coupons) is derived by the server.
            load(true);
          }}
          onOpenCoupon={onOpenCoupon}
          onToast={onToast}
        />
      ) : (
        <PhaseList phases={phases} stats={stats} loadState={loadState} onRetry={() => load()} onCreate={() => go({ kind: 'form' })} onOpen={(p) => go({ kind: 'detail', id: p.id })} />
      )}
    </div>
  );
}
