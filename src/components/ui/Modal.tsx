import { useEffect } from 'react';
import { Icon } from '@iconify/react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

// Same shell as the existing app modals; becomes a bottom sheet on mobile.
export default function Modal({ title, onClose, children, footer, maxWidth = 'sm:max-w-md' }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-semibold text-[#1A1A1A] truncate">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 -mr-2 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB] flex-shrink-0 ml-2"
          >
            <Icon icon="solar:close-linear" width={18} height={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
