import { useCallback, useEffect, useRef, useState } from 'react';
import PromoList from './PromoList';
import PromoForm from './PromoForm';
import PromoSort from './PromoSort';
import type { Placement } from './placements';
import { nowLocal, type PromoItem } from '../../../data/appBanners';
import type { SetEvent } from '../../../data/setEvents';

type Screen = { kind: 'list' } | { kind: 'form'; id: string | null } | { kind: 'sort'; focusId?: string };

interface PromoManagerProps {
  /** Banner or Cover Page. */
  placement: Placement;
  /** Set Event events, for linking to an event. */
  events: SetEvent[];
  onToast: (message: string) => void;
  /** Lets the app guard navigation away from an unsaved form. */
  onDirtyChange: (dirty: boolean) => void;
}

// "Set Banner in App" / "Set Cover Page in App": list ⇄ create / edit form ⇄ sort, all on one menu.
export default function PromoManager({ placement, events, onToast, onDirtyChange }: PromoManagerProps) {
  const api = placement.api;
  const noun = placement.noun;
  const [screen, setScreen] = useState<Screen>({ kind: 'list' });
  const [banners, setBanners] = useState<PromoItem[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setLoadState('loading');
    api
      .list()
      .then((list) => {
        setBanners(list);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, [api]);

  useEffect(load, [load]);

  const go = (next: Screen) => {
    setScreen(next);
    setActionError('');
    rootRef.current?.closest('main')?.scrollTo(0, 0);
  };

  /** Runs a list action; on failure keeps the list and explains what happened. */
  const run = async (id: string, action: () => Promise<unknown>, success: string, failure: string) => {
    setBusyId(id);
    setActionError('');
    try {
      await action();
      setBanners(await api.list());
      onToast(success);
    } catch {
      setActionError(failure);
    } finally {
      setBusyId(null);
    }
  };

  const editing = screen.kind === 'form' && screen.id ? banners.find((b) => b.id === screen.id) : undefined;

  return (
    <div ref={rootRef} className="min-h-full flex flex-col">
      {screen.kind === 'list' && (
        <PromoList
          placement={placement}
          items={banners}
          loadState={loadState}
          actionError={actionError}
          busyId={busyId}
          onRetry={load}
          onCreate={() => go({ kind: 'form', id: null })}
          onEdit={(b) => go({ kind: 'form', id: b.id })}
          onSort={(focusId) => go({ kind: 'sort', focusId })}
          onDuplicate={(b) =>
            run(
              b.id,
              async () => {
                // Copies start as drafts so two identical items never go live by accident.
                const copy = await api.save({ ...b, id: '', name: `${b.name} (Copy)`, status: 'draft', createdAt: nowLocal(), updatedAt: nowLocal() });
                setBanners(await api.list());
                go({ kind: 'form', id: copy.id });
              },
              `${noun} duplicated. It’s saved as a draft.`,
              `Couldn’t duplicate the ${noun.toLowerCase()}. Try again.`,
            )
          }
          onSetStatus={(b, status) =>
            run(
              b.id,
              () => api.save({ ...b, status, updatedAt: nowLocal() }),
              status === 'active' ? `${noun} activated.` : `${noun} deactivated.`,
              `Couldn’t change the ${noun.toLowerCase()} status. Try again.`,
            )
          }
          onDelete={(b) => run(b.id, () => api.remove(b.id), `${noun} deleted.`, `Couldn’t delete the ${noun.toLowerCase()}. Try again.`)}
        />
      )}

      {screen.kind === 'form' && (screen.id === null || editing) && (
        <PromoForm
          key={screen.id ?? 'new'}
          placement={placement}
          item={editing}
          events={events}
          allItems={banners}
          onDirtyChange={onDirtyChange}
          onCancel={() => go({ kind: 'list' })}
          onSaved={(saved, created) => {
            setBanners((list) => (created ? [...list, saved] : list.map((b) => (b.id === saved.id ? saved : b))));
            onToast(created ? `${noun} created successfully.` : `${noun} updated successfully.`);
            go({ kind: 'list' });
          }}
        />
      )}

      {screen.kind === 'sort' && (
        <PromoSort
          placement={placement}
          items={banners}
          focusId={screen.focusId}
          onCancel={() => go({ kind: 'list' })}
          onSaved={(list) => {
            setBanners(list);
            onToast(`${noun} order saved.`);
            go({ kind: 'list' });
          }}
        />
      )}
    </div>
  );
}
