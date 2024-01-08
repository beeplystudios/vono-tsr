import { Await, Route, defer } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { Suspense } from "react";

export const streamingRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/streaming",
  beforeLoad({ context }) {
    context.updateHead({
      title: "Streaming",
    });
  },
  loader: async ({ context }) => {
    const promise = context.client.long.query();
    return {
      promise: defer(promise),
    };
  },
  component: () => {
    const { promise } = streamingRoute.useLoaderData();

    return (
      <Suspense fallback={<p>Loading..</p>} key="this is a key">
        <Await promise={promise}>{(data) => <p>Loaded: {data}</p>}</Await>
      </Suspense>
    );
  },
});
