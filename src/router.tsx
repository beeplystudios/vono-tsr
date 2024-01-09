import { QueryClient } from "@tanstack/react-query";
import { Router } from "@tanstack/react-router";
import { createTRPCClient } from "@trpc/client";
import { createTRPCQueryUtils } from "@trpc/react-query";
import { type Head } from "@unhead/schema";
import { whitelistSafeInput } from "@unhead/shared";
import { type createHead } from "unhead";
import { type AppRouter } from "../server/trpc";
import { QueryProviders } from "./lib/trpc";
import { indexRoute } from "./routes";
import { aboutRoute } from "./routes/about";
import { rootRoute } from "./routes/root";
import { streamingRoute } from "./routes/streaming";

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  streamingRoute,
]);

export const createRouter = (opts: {
  head: ReturnType<typeof createHead<Head>>;
  queryClient: QueryClient;
  trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;
}) => {
  return new Router({
    routeTree,
    context: {
      updateHead: (metadata) => {
        opts.head.push(metadata, {
          // @ts-expect-error blame unhead
          transform: whitelistSafeInput,
        });
      },
      queryUtils: createTRPCQueryUtils<AppRouter>({
        client: opts.trpcClient,
        queryClient: opts.queryClient,
      }),
    },
    Wrap: (props) => {
      return (
        <QueryProviders queryClient={opts.queryClient}>
          {props.children}
        </QueryProviders>
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
