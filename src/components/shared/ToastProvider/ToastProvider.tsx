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

