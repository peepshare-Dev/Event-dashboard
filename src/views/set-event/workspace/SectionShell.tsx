import StatusBadge from '../../../components/ui/StatusBadge';
import CopyIdButton from '../../../components/set-event/CopyIdButton';
import type { SetEvent } from '../../../data/setEvents';

interface SectionShellProps {
  event: SetEvent;
  /** Section name, shown in the breadcrumb (the page title is the event). */
  title: string;
  onBack: () => void;
  actions?: React.ReactNode;
  /** Content sits flush with the card edges (tables) instead of padded. */
  flush?: boolean;
  children: React.ReactNode;
}

// Card frame shared by the event sections: breadcrumb, the event as the page title, actions.
export default function SectionShell({ event, title, onBack, actions, flush, children }: SectionShellProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
          <nav aria-label="Breadcrumb" className="text-xs text-[#6B7280] truncate">
            <button onClick={onBack} className="underline underline-offset-2 hover:text-[#FF6115]">
              Event List
            </button>
            <span className="mx-1">/</span>
            <span>{event.name || 'Untitled'}</span>
            <span className="mx-1">/</span>
            <span aria-current="page">{title}</span>
          </nav>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-baseline gap-2 min-w-0 text-[22px] font-medium">
                <CopyIdButton id={event.id} />
                <h1 className="text-[#1A1A1A] truncate">{event.name || 'Untitled'}</h1>
              </div>
              <StatusBadge status={event.status} shape="pill" />
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
          </div>
        </div>
        <div className={flush ? '' : 'p-4 sm:p-6'}>{children}</div>
      </div>
    </div>
  );
}
