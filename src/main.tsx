/**
 * Application entry point.
 * 
 * Data sources:
 * - React DOM root element (#root)
 * 
 * Results:
 * - Renders: Application to DOM root element
 * 
 * Uses:
 * - react (StrictMode, createRoot)
 * - react-router-dom (RouterProvider)
 * - context/PlanContext.tsx (PlanProvider)
 * - Router.tsx (router)
 * - Styles/main.scss (global styles)
 * - Font sources (@fontsource packages)
 * 
 * Used by:
 * - index.html - entry point for the application
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { PlanProvider } from "./context/PlanContext";
import { router } from "./Router";
import "@fontsource/combo/400.css";
import "@fontsource/noto-sans/400.css";
import "@fontsource/sour-gummy/400.css";
import "@fontsource/sour-gummy/600.css";
import "@fontsource/sour-gummy/800.css";
import "./Styles/main.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlanProvider>
      <RouterProvider router={router} />
    </PlanProvider>
  </StrictMode>
);
