import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

export const appRouter = router({
  hello: publicProcedure.query(async () => {
    return "Hello World " + Math.random();
  }),
  long: publicProcedure.query(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return "Hello World " + Math.random();
  }),
});

export type AppRouter = typeof appRouter;
