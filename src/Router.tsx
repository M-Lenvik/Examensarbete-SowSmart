/**
 * Router configuration for the application.
 * 
 * Data sources:
 * - Routes defined in this file
 * 
 * Results:
 * - router: HashRouter configuration with all routes
 * 
 * Uses:
 * - react-router-dom (createHashRouter)
 * - components/shared/Layout/Layout.tsx (Layout)
 * - pages/* (all page components)
 * 
 * Used by:
 * - main.tsx - for rendering the application
 */

import { createHashRouter } from "react-router-dom";
import { Layout } from "./components/shared/Layout/Layout";
import { About } from "./pages/About";
import { CalendarView } from "./pages/CalendarView";
import { ErrorPage } from "./pages/ErrorPage";
import { GrowingTips } from "./pages/GrowingTips";
import { HarvestPlanner } from "./pages/HarvestPlanner";
import { Home } from "./pages/Home";
import { MyGarden } from "./pages/MyGarden";
import { PlantSelection } from "./pages/PlantSelection";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "plants",
        element: <PlantSelection />,
      },
      {
        path: "planner",
        element: <HarvestPlanner />,
      },
      {
        path: "calendar",
        element: <CalendarView />,
      },
      {
        path: "my-garden",
        element: <MyGarden />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "growing-tips",
        element: <GrowingTips />,
      },
    ],
  },
]);

