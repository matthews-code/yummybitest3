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
          z.object({
            item_uid: z.string(),
            quantity: z.number(),
            multiplier: z.number(),
          }),
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
              multiplier: inputOrder.multiplier,
            })),
          },
        },
      });
    }),

  editOrder: adminRoleProcedure
    .input(
      z.object({
        orderUid: z.string(),
        date: z.string(),
        amount_due: z.number(),
        payment_mode: z.nativeEnum(Payment_mode),
        delivery_mode: z.nativeEnum(Delivery_mode),
        note: z.string(),
        user_uid: z.string(),
        item_order: z.array(
          z.object({
            item_uid: z.string(),
            quantity: z.number(),
            multiplier: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deleteItemOrders = ctx.db.item_order.deleteMany({
        where: {
          order_uid: input.orderUid,
        },
      });

      const updateOrder = ctx.db.orders.update({
        where: {
          order_uid: input.orderUid,
        },
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
              multiplier: inputOrder.multiplier,
            })),
          },
        },
      });

      return await ctx.db.$transaction([deleteItemOrders, updateOrder]);
    }),

  deleteOrder: adminRoleProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleteItemOrders = ctx.db.item_order.deleteMany({
        where: {
          order_uid: input.uid,
        },
      });

      const deleteOrder = ctx.db.orders.delete({
        where: {
          order_uid: input.uid,
        },
      });

      return await ctx.db.$transaction([deleteItemOrders, deleteOrder]);
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

  getAllOrders: userRoleProcedure
    .input(z.object({ date: z.date() }))
    .query(({ ctx, input }) => {
      // console.log("\n");
      // console.log(dayjs(input.date).format("ddd, DD MMM YYYY H:mm:ss"));

      // console.log("\nPHT");
      // console.log(
      //   "Greater than\t" +
      //     dayjs(input.date).startOf("d").format("ddd, DD MMM YYYY H:mm:ss"),
      // );

      // console.log(
      //   "Less than\t" +
      //     dayjs(input.date)
      //       .add(1, "d")
      //       .startOf("d")
      //       .format("ddd, DD MMM YYYY H:mm:ss"),
      // );

      // console.log("\n");
      // console.log(dayjs.utc(input.date).format("ddd, DD MMM YYYY H:mm:ss"));

      // console.log("\nGMT");
      // console.log("Greater than\t" + dayjs(input.date).startOf("d").toString());
      // console.log("Less than\t" + dayjs(input.date).endOf("d").toString());

      // console.log("\n");

      return ctx.db.orders.findMany({
        where: {
          deleted: false,
          AND: [
            {
              date: {
                lt: dayjs(input.date).add(1, "d").startOf("d").toDate(),
              },
            },
            { date: { gte: dayjs(input.date).startOf("d").toDate() } },
          ],
        },
        include: { item_order: true },
        orderBy: [
          {
            date: "asc",
          },
          {
            user_uid: "asc",
          },
        ],
      });
    }),
});
