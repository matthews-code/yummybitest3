import { z } from "zod";

import {
  createTRPCRouter,
  userRoleProcedure,
  adminRoleProcedure,
  superAdminRoleProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  sample: adminRoleProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  createItem: adminRoleProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        inventory: z.number().int(),
      }),
    )
    .mutation(({ ctx, input }) => {
      // simulate a slow db call

      // await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.items.create({
        data: {
          name: input.name,
          price: input.price,
          inventory: input.inventory,
        },
      });
    }),

  // deleteItem:
  getAllItems: userRoleProcedure.query(async ({ ctx }) => {
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    return ctx.db.items.findMany();
  }),
});
