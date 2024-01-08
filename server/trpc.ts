import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

const router = t.router;
const publicProcedure = t.procedure;

export const appRouter = router({
  hello: publicProcedure.query(async () => {
    return "Hello World " + Math.random();
  }),
});

export type AppRouter = typeof appRouter;
