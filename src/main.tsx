import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { PlanProvider } from "./context/PlanContext";
import { router } from "./Router";
import "./Styles/main.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlanProvider>
      <RouterProvider router={router} />
    </PlanProvider>
  </StrictMode>
);
