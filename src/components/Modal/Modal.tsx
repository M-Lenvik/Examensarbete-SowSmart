import { useEffect } from "react";
import { createPortal } from "react-dom";

import type React from "react";

import "./Modal.scss";

type ModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal = ({ isOpen, title, onClose, children }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
      >
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Stäng dialog"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        {/* Modal content whith plant information like category, subcategory, type, planting method, planting windows, days outdoor to harvest, days indoor growth, hardening days, move plant outdoor, url, description */}
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};