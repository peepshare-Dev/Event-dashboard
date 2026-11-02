import { useCallback, useEffect, useRef, useState } from 'react';
import SlugList from './SlugList';
import SlugForm from './SlugForm';
import { slugApi, type SlugValue } from '../../data/mock/slugApi';
import { useT } from '@/i18n';

type Screen = { kind: 'list' } | { kind: 'form'; id: string | null };

interface SlugManagerProps {
  onToast: (message: string) => void;
  /** Lets the app guard navigation away from an unsaved form. */
  onDirtyChange: (dirty: boolean) => void;
}

// "Slug": list ⇄ create / edit form, on one menu.
export default function SlugManager({ onToast, onDirtyChange }: SlugManagerProps) {
  const t = useT();
  const [screen, setScreen] = useState<Screen>({ kind: 'list' });
  const [items, setItems] = useState<SlugValue[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setLoadState('loading');
    slugApi
      .list()
      .then((list) => {
        setItems(list);
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

  const remove = async (s: SlugValue) => {
    setBusyId(s.id);
    setActionError('');
    try {
      await slugApi.remove(s.id);
      setItems((list) => list.filter((x) => x.id !== s.id));
      onToast(t('Slug deleted.'));
    } catch {
      setActionError(t('Couldn’t delete the slug. Try again.'));
    } finally {
      setBusyId(null);
    }
  };

  const editing = screen.kind === 'form' && screen.id ? items.find((s) => s.id === screen.id) : undefined;

  return (
    <div ref={rootRef} className="min-h-full flex flex-col">
      {screen.kind === 'list' && (
        <SlugList
          items={items}
          loadState={loadState}
          actionError={actionError}
          busyId={busyId}
          onRetry={load}
          onCreate={() => go({ kind: 'form', id: null })}
          onEdit={(s) => go({ kind: 'form', id: s.id })}
          onDelete={remove}
          onToast={onToast}
        />
      )}

      {screen.kind === 'form' && (screen.id === null || editing) && (
        <SlugForm
          key={screen.id ?? 'new'}
          item={editing}
          allItems={items}
          onDirtyChange={onDirtyChange}
          onCancel={() => go({ kind: 'list' })}
          onSaved={(saved, created) => {
            setItems((list) => (created ? [saved, ...list] : list.map((s) => (s.id === saved.id ? saved : s))));
            onToast(created ? t('Slug created successfully.') : t('Slug updated successfully.'));
            go({ kind: 'list' });
          }}
        />
      )}
    </div>
  );
}
