import { Delivery_mode, Payment_mode } from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";

import {
  createTRPCRouter,
  userRoleProcedure,
  adminRoleProcedure,
  superAdminRoleProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
  createOrder: adminRoleProcedure
    .input(
      z.object({
        date: z.string(),
        amount_due: z.number(),
        payment_mode: z.nativeEnum(Payment_mode),
        delivery_mode: z.nativeEnum(Delivery_mode),
        note: z.string(),
        user_uid: z.string(),
        item_order: z.array(
          z.object({ item_uid: z.string(), quantity: z.number() }),
        ),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.orders.create({
        data: {
          date: input.date,
          amount_due: input.amount_due,
          payment_mode: input.payment_mode,
          delivery_mode: input.delivery_mode,
          note: input.note,
          user_uid: input.user_uid,
          item_order: {
            create: input.item_order.map((inputOrder) => ({
              item_uid: inputOrder.item_uid,
              quantity: inputOrder.quantity,
            })),
          },
        },
      });
    }),

  togglePaid: adminRoleProcedure
    .input(z.object({ order_uid: z.string(), paid: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.orders.update({
        where: {
          order_uid: input.order_uid,
        },
        data: {
          paid: !input.paid,
        },
      });
    }),

  getAllOrders: userRoleProcedure.query(({ ctx }) => {
    return ctx.db.orders.findMany({
      include: { item_order: true },
      orderBy: [
        {
          date: "asc",
        },
      ],
    });
  }),
});
