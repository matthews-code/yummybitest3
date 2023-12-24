import dayjs from "dayjs";
import { z } from "zod";

import {
  createTRPCRouter,
  userRoleProcedure,
  adminRoleProcedure,
  superAdminRoleProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  // sample: adminRoleProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),

  createItem: adminRoleProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        inventory: z.number().int().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.items.create({
        data: {
          name: input.name,
          price: input.price,
          inventory: input.inventory ?? null,
          created_at: dayjs().toISOString(),
        },
      });
    }),

  editItem: adminRoleProcedure
    .input(
      z.object({
        uid: z.string(),
        name: z.string(),
        price: z.number(),
        inventory: z.number().int().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.items.update({
        where: {
          item_uid: input.uid,
        },
        data: {
          name: input.name,
          price: input.price,
          inventory: input.inventory ?? null,
        },
      });
    }),

  deleteItem: adminRoleProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.items.delete({
        where: {
          item_uid: input.uid,
        },
      });
    }),

  getAllItems: userRoleProcedure.query(({ ctx }) => {
    return ctx.db.items.findMany({
      orderBy: [
        {
          created_at: "asc",
        },
      ],
    });
  }),
});
