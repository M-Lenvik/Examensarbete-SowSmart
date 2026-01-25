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
