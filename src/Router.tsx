import { createHashRouter } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <div>Ett fel uppstod</div>,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);

