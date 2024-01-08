import { Link, Route } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { trpc } from "../trpc";

export const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  beforeLoad: ({ context }) => {
    context.updateHead({
      title: "About",
    });
  },
  loader: ({ context }) => {
    return context.client.hello.query();
  },
  component: () => {
    const initialData = aboutRoute.useLoaderData();

    const query = trpc.hello.useQuery(undefined, {
      initialData,
    });

    return (
      <>
        <h1>About</h1>
        <p>This is the about page.</p>
        <p>{query.data}</p>
        <Link to="/">Go Home</Link>
      </>
    );
  },
});
