import { Modal } from "../Modal/Modal";
import { Button } from "../Button/Button";
import "./ConfirmDialog.scss";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Ta bort",
  cancelText = "Avbryt",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <div className="confirm-dialog">
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <Button variant="secondary" className="confirm-dialog__cancel-button" onClick={onCancel}>
            {cancelText}
          </Button>
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

