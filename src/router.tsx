import { Router } from "@tanstack/react-router";
import { indexRoute } from "./routes";
import { rootRoute } from "./routes/root";
import { aboutRoute } from "./routes/about";
import { type createHead } from "unhead";
import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
  hydrate,
} from "@tanstack/react-query";
import { trpc } from "./trpc";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "../server/trpc";

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

export const createRouter = (head: ReturnType<typeof createHead>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: (query) => (query.state.data ? false : "always"),
      },
    },
  });

  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:5173/trpc",
      }),
    ],
  });
  const trpcReactClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: "http://localhost:5173/trpc",
      }),
    ],
  });

  return new Router({
    routeTree,
    context: {
      updateHead: (metadata) => {
        head.push(metadata);
      },
      client: trpcClient,
    },
    dehydrate() {
      return {
        queryClientState: dehydrate(queryClient),
      };
    },
    hydrate(dehydrated) {
      hydrate(queryClient, dehydrated.queryClientState);
    },

    Wrap: (props) => {
      return (
        <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {props.children}
          </QueryClientProvider>
        </trpc.Provider>
      );
    },
    defaultPreloadStaleTime: 0,
  });
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
