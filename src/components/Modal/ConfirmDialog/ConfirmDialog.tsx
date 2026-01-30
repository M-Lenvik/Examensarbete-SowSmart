/**
 * ConfirmDialog component - confirmation dialog for destructive actions.
 * 
 * Data sources:
 * - Props: isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant
 * 
 * Results:
 * - Returns: JSX (modal with confirmation message and action buttons)
 * 
 * Uses:
 * - components/Modal/Modal.tsx (Modal)
 * 
 * Used by:
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx - for confirming plant removal
 */

import { Modal } from "../Modal";
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
  confirmText = "Ja, ta bort",
  cancelText = "Nej",
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

