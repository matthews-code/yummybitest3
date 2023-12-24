import { postRouter } from "~/server/api/routers/post";
import { itemRouter } from "~/server/api/routers/item";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  item: itemRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
