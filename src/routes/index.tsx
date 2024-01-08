import { Link, Route } from "@tanstack/react-router";
import { trpc } from "../trpc";
import { rootRoute } from "./root";

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ context }) => {
    context.updateHead({
      title: "Home",
    });
  },
  loader: ({ context }) => {
    return context.client.hello.query();
  },
  component: () => {
    const initialData = indexRoute.useLoaderData();

    const [data] = trpc.hello.useSuspenseQuery(undefined, {
      initialData,
    });

    const utils = trpc.useUtils();

    return (
      <>
        <h1>Hi there!</h1>
        <p>{data}</p>
        <button onClick={() => utils.hello.invalidate()}>
          Invalidate Query
        </button>
        <Link to="/about">Go to About</Link>
      </>
    );
  },
});
