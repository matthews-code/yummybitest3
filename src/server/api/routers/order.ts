import { Delivery_mode, Payment_mode } from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

import {
  createTRPCRouter,
  userRoleProcedure,
  adminRoleProcedure,
  superAdminRoleProcedure,
  publicProcedure,
} from "~/server/api/trpc";

dayjs.extend(utc);

export const orderRouter = createTRPCRouter({
  createOrder: userRoleProcedure
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
    .input(z.object({ date: z.string().datetime() }))
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

      // console.log("less than");
      // console.log(dayjs(input.date).add(1, "d").startOf("d").toDate());
      // console.log("greater than");
      // console.log(dayjs(input.date).startOf("d").toDate());

      // console.log("less than");
      // console.log(dayjs(input.date).add(1, "d").startOf("d").toISOString());

      // console.log("greater than equal to");
      // console.log(dayjs(input.date).startOf("d").toISOString());

      // console.log(input.date);
      // console.log(dayjs.utc(input.date).startOf("d"));

      return ctx.db.orders.findMany({
        where: {
          deleted: false,
          AND: [
            {
              date: {
                lt: dayjs.utc(input.date).add(1, "d").toISOString(),
                // lt: dayjs.utc(input.date),
              },
            },
            // { date: { gte: dayjs.utc(input.date).startOf("d").toISOString() } },
            { date: { gte: input.date } },
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
