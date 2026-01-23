import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../Header/Header";
import { ScrollToBottom } from "../ScrollToBottom/ScrollToBottom";
import { ScrollToTop } from "../ScrollToTop/ScrollToTop";
import { ToastProvider } from "../ToastProvider/ToastProvider";
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
      <ToastProvider />
    </>
  );
};

