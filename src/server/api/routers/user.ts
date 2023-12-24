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

  getAllUsers: userRoleProcedure.query(({ ctx }) => {
    return ctx.db.users.findMany({
      orderBy: [
        {
          // last_name: "asc",
          first_name: "asc",
        },
      ],
    });
  }),
});
