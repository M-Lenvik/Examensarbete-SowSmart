/**
 * Layout component - main layout wrapper with header, navigation, and toast system.
 * 
 * Data sources:
 * - useLocation: From react-router-dom (current route pathname)
 * 
 * Results:
 * - Returns: JSX (layout with header, main content area, scroll helpers, and toast provider)
 * 
 * Uses:
 * - react-router-dom (Outlet, useLocation)
 * - components/shared/Header/Header.tsx (Header)
 * - components/shared/ScrollToBottom/ScrollToBottom.tsx (ScrollToBottom)
 * - components/shared/ScrollToTop/ScrollToTop.tsx (ScrollToTop)
 * - components/shared/ToastProvider/ToastProvider.tsx (ToastProvider)
 * 
 * Used by:
 * - Router.tsx - as root layout for all routes
 */

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

