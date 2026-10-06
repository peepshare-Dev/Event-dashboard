import { useEffect, useId, useRef } from 'react';
import { Icon } from '@iconify/react';

interface DrawerProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Pinned action row at the bottom of the panel. */
  footer?: React.ReactNode;
  /** Panel width from `sm` up; full screen below that. */
  maxWidth?: string;
}

// Right-side panel over the current page; full screen on phones.
export default function Drawer({ title, description, onClose, children, footer, maxWidth = 'sm:max-w-[640px]' }: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    // preventScroll: focusing must not scroll the page behind the drawer.
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} h-full bg-white shadow-xl flex flex-col focus:outline-none`}
      >
        <div className="flex items-start gap-3 px-4 sm:px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-[#1A1A1A]">
              {title}
            </h2>
            {description && <p className="text-sm text-[#6B7280] mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 -mr-2 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            <Icon icon="solar:close-linear" width={20} height={20} />
          </button>
        </div>
        <div className="relative flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 px-4 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:py-4 border-t border-[#E5E7EB] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
