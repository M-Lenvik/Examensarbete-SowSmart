import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Header } from "../Header/Header";
import { ScrollToBottom } from "../ScrollToBottom/ScrollToBottom";
import { ScrollToTop } from "../ScrollToTop/ScrollToTop";
import "./Layout.scss";

export const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <ScrollToBottom />
      <ScrollToTop />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 1500,
          success: {
            className: "toast-success",
          },
          error: {
            className: "toast-error",
          },
        }}
      />
    </>
  );
};

