import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { appRouter } from "./trpc";

const hono = new Hono();

hono.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

hono.get("/*", async (ctx) => {
  const render = await import("./renderer").then((m) => m.default);

  const stream = await render(new URL(ctx.req.url).pathname);

  return ctx.body(stream, {
    headers: {
      "transfer-encoding": "chunked",
      "content-type": "text/html; charset=UTF-8",
    },
  });
});

export default hono;
