import { Outlet, rootRouteWithContext } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";
import { createTRPCQueryUtils } from "@trpc/react-query";
import { type Head } from "@unhead/schema";
import { type createHead } from "unhead";
import { type AppRouter } from "../../server/trpc";

interface RouterContext {
  updateHead: (
    metadata: Parameters<ReturnType<typeof createHead<Head>>["push"]>[0]
  ) => void;
  queryUtils: ReturnType<typeof createTRPCQueryUtils<AppRouter>>;
}

export const rootRoute = rootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <p>Root Layout</p>
      <Outlet />
      <DehydrateRouter />
    </>
  );
}
