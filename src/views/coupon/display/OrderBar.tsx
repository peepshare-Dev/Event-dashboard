import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import { useT } from '@/i18n';

interface OrderBarProps {
  dirty: boolean;
  saving: boolean;
  error: string;
  /** Shown while the order is unchanged, e.g. how to reorder. */
  hint: string;
  onSave: () => void;
  onDiscard: () => void;
}

// Unsaved-order state with explicit Save order / Discard (reordering never saves on its own).
export default function OrderBar({ dirty, saving, error, hint, onSave, onDiscard }: OrderBarProps) {
  const t = useT();
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border px-4 py-2.5 ${dirty ? 'border-[#FFB38F] bg-[#FFF5EF]' : 'border-[#E5E7EB] bg-[#F9FAFB]'}`}>
      <div className="flex-1 min-w-0 text-sm" aria-live="polite">
        {error ? (
          <span role="alert" className="flex items-center gap-1.5 text-[#DC2626]">
            <Icon icon="solar:danger-circle-linear" width={16} height={16} className="flex-shrink-0" />
            {error}
          </span>
        ) : dirty ? (
          <span className="flex items-center gap-2 font-medium text-[#E5540F]">
            <span className="w-2 h-2 rounded-full bg-[#FF6115]" aria-hidden="true" />
            {t('Unsaved order — the app still uses the saved order.')}
          </span>
        ) : (
          <span className="text-[#6B7280]">{hint}</span>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="ghost" onClick={onDiscard} disabled={!dirty || saving}>
          {t('Discard')}
        </Button>
        <Button icon="solar:check-read-linear" onClick={onSave} disabled={!dirty || saving}>
          {saving ? t('Saving…') : t('Save order')}
        </Button>
      </div>
    </div>
  );
}
