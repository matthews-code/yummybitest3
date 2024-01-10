import dayjs from "dayjs";
import { z } from "zod";

import {
  createTRPCRouter,
  userRoleProcedure,
  adminRoleProcedure,
  superAdminRoleProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  createUser: adminRoleProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string().nullable(),
        contactNum: z.string(),
        address: z.string().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.users.create({
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          contact_num: input.contactNum,
          address: input.address,
        },
      });
    }),

  editUser: adminRoleProcedure
    .input(
      z.object({
        uid: z.string(),
        firstName: z.string(),
        lastName: z.string().nullable(),
        contactNum: z.string(),
        address: z.string().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.users.update({
        where: {
          user_uid: input.uid,
        },
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          contact_num: input.contactNum,
          address: input.address,
        },
      });
    }),

  deleteUser: adminRoleProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.users.update({
        where: {
          user_uid: input.uid,
        },
        data: {
          deleted: true,
        },
      });
    }),

  getAllUsers: userRoleProcedure.query(({ ctx }) => {
    return ctx.db.users.findMany({
      orderBy: [
        {
          // last_name: "asc",
          first_name: "asc",
        },
        {
          user_uid: "asc",
        },
      ],
    });
  }),
});
