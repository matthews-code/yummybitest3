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
  createItem: superAdminRoleProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        bulkPrice: z.number(),
        inventory: z.number().int().nullable(),
        serving: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.items.create({
        data: {
          name: input.name,
          price: input.price,
          bulk_price: input.bulkPrice,
          inventory: input.inventory ?? null,
          serving: input.serving,
          created_at: dayjs().toISOString(),
        },
      });
    }),

  editItem: superAdminRoleProcedure
    .input(
      z.object({
        uid: z.string(),
        name: z.string(),
        price: z.number(),
        bulkPrice: z.number(),
        inventory: z.number().int().nullable(),
        serving: z.number(),
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
          bulk_price: input.bulkPrice,
          inventory: input.inventory ?? null,
          serving: input.serving,
        },
      });
    }),

  deleteItem: superAdminRoleProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.items.update({
        where: {
          item_uid: input.uid,
        },
        data: {
          name: input.uid,
          deleted: true,
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
