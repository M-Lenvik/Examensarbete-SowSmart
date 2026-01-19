import { Modal } from "../Modal/Modal";
import "./ConfirmDialog.scss";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "success";
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Ta bort",
  cancelText = "Avbryt",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const dialogClass = `confirm-dialog confirm-dialog--${variant}`;

  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <div className={dialogClass}>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__cancel-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="confirm-dialog__confirm-button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

