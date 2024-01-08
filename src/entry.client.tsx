import { StartClient } from "@tanstack/react-router-server/client";
import ReactDOM from "react-dom/client";
import { createHead } from "unhead";
import { createRouter } from "./router";

const rootElement = document.getElementById("app");

if (rootElement) {
  const router = createRouter(createHead());
  router.hydrate();
  ReactDOM.hydrateRoot(rootElement, <StartClient router={router} />);
}
