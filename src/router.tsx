import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "@tanstack/react-router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { type Head } from "@unhead/schema";
import { whitelistSafeInput } from "@unhead/shared";
import { type createHead } from "unhead";
import { type AppRouter } from "../server/trpc";
import { indexRoute } from "./routes";
import { aboutRoute } from "./routes/about";
import { rootRoute } from "./routes/root";
import { streamingRoute } from "./routes/streaming";
import { trpc } from "./trpc";

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  streamingRoute,
]);

export const createRouter = (head: ReturnType<typeof createHead<Head>>) => {
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
        head.push(metadata, {
          // @ts-expect-error blame unhead
          transform: whitelistSafeInput,
        });
      },
      client: trpcClient,
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
