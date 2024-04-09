import { createBrowserRouter } from "react-router-dom";

import HomePage from "@/pages";

const routeList = [
  {
    path: "/",
    element: <HomePage />,
  },
];

export const router = createBrowserRouter(routeList);
