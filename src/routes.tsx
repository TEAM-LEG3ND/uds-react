import { createBrowserRouter, defer } from "react-router-dom";

import { getAuthMe } from "@/effects/apis";
import Layout from "@/features/layout/Layout";
import HomePage from "@/pages";
import AuthCallbackPage from "@/pages/auth-callback";

const routeList = [
  {
    path: "/",
    element: <Layout />,
    loader: () => {
      const mePromise = getAuthMe();

      return defer({ me: mePromise });
    },
    children: [
      {
        path: "",
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
];

export const router = createBrowserRouter(routeList);
