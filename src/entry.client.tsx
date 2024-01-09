import { StartClient } from "@tanstack/react-router-server/client";
import ReactDOM from "react-dom/client";
import { createHead } from "unhead";
import { baseLinks, createQueryClient, createTRPCClient } from "./lib/trpc";
import { createRouter } from "./router";

const rootElement = document.getElementById("app");

if (rootElement) {
  const router = createRouter({
    head: createHead(),
    queryClient: createQueryClient(),
    trpcClient: createTRPCClient(baseLinks),
  });

  router.hydrate();
  ReactDOM.hydrateRoot(rootElement, <StartClient router={router} />);
}
