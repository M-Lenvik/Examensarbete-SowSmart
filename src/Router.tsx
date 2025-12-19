import { createHashRouter } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { About } from "./pages/About";
import { CalendarView } from "./pages/CalendarView";
import { ErrorPage } from "./pages/ErrorPage";
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
    ],
  },
]);

