/**
 * ToastProvider component - provides toast notification system for the application.
 * 
 * Data sources:
 * - react-hot-toast: Toast library
 * 
 * Results:
 * - Returns: JSX (Toaster component for displaying toast notifications)
 * 
 * Uses:
 * - react-hot-toast (Toaster)
 * 
 * Used by:
 * - components/shared/Layout/Layout.tsx - as global toast provider
 */

import { Toaster } from "react-hot-toast";
import "./ToastProvider.scss";

export const ToastProvider = () => {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 2000,
        success: {
          className: "toast-success",
        },
        error: {
          className: "toast-error",
        },
      }}
    />
  );
};

