import { Link, Route } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { trpc } from "../lib/trpc";

export const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  beforeLoad: ({ context }) => {
    context.updateHead({
      title: "About",
    });
  },
  loader: ({ context }) => {
    return context.queryUtils.hello.ensureData();
  },
  component: () => {
    const initialData = aboutRoute.useLoaderData();

    const [data] = trpc.hello.useSuspenseQuery(undefined, {
      initialData,
    });

    return (
      <>
        <h1>About</h1>
        <p>This is the about page.</p>
        <p>{data}</p>
        <Link to="/">Go Home</Link>
      </>
    );
  },
});
