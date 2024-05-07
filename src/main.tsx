import "@/styles/normalize.css";
import "@/styles/globals.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import Root from "@/pages/__root";
import { router } from "@/routes";

const rootElement = document.getElementById("app") as HTMLElement;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Root>
        <RouterProvider router={router} />
      </Root>
    </StrictMode>
  );
}
