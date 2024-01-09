import {
  createTRPCReact,
  httpBatchLink,
  createTRPCClient as _createTRPCClient,
} from "@trpc/react-query";
import { type AppRouter } from "../../server/trpc";
import { QueryClient } from "@tanstack/query-core";
import superjson from "superjson";
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";

const TRPC_URL = import.meta.env.VITE_API_URL + "/trpc";

type Headers = Parameters<typeof httpBatchLink>[0]["headers"];

export const createLinks = (headers?: Headers) => {
  return () => [
    httpBatchLink({
      url: TRPC_URL,
      headers,
    }),
  ];
};

export const baseLinks = createLinks();

export const trpc = createTRPCReact<AppRouter>();

type ProviderProps = {
  children: React.ReactNode;
  queryClient: QueryClient;
};

export const QueryProviders = (props: ProviderProps) => {
  const client = trpc.createClient({
    links: baseLinks(),
    transformer: superjson,
  });

  return (
    <trpc.Provider client={client} queryClient={props.queryClient}>
      <QueryClientProvider client={props.queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: (query) => (query.state.data ? false : "always"),
      },
    },
  });
};

export const createTRPCClient = (links: ReturnType<typeof createLinks>) => {
  return _createTRPCClient<AppRouter>({
    links: links(),
    transformer: superjson,
  });
};
