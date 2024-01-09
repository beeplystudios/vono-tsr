import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { appRouter } from "./trpc";
import { render } from "./renderer";

const hono = new Hono();

hono.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    
  })
);

hono.get("/*", async (ctx) => {
  const stream = await render(ctx);

  return ctx.body(stream, {
    headers: {
      "transfer-encoding": "chunked",
      "content-type": "text/html; charset=UTF-8",
    },
  });
});

export default hono;
