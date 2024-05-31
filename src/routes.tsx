import { createBrowserRouter, defer } from "react-router-dom";

import { getAuthMe } from "@/effects/apis";
import HomePage from "@/pages";
import AuthCallbackPage from "@/pages/auth-callback";

const routeList = [
  {
    path: "/",
    element: <HomePage />,
    loader: () => {
      const mePromise = getAuthMe();

      return defer({ me: mePromise });
    },
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
];

export const router = createBrowserRouter(routeList);
