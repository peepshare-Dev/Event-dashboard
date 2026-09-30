import { Icon } from '@iconify/react';
import Modal from './Modal';
import Button from './Button';

interface DeleteConfirmationModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmationModal({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} autoFocus>
            Cancel
          </Button>
          <Button variant="destructive" icon="solar:trash-bin-trash-linear" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
          <Icon icon="solar:danger-triangle-linear" width={20} height={20} className="text-[#DC2626]" />
        </div>
        <div className="text-sm text-[#4B5563] leading-relaxed pt-2">{message}</div>
      </div>
    </Modal>
  );
}
