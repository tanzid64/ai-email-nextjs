import { db } from "@/server/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const authorizeAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      name: true,
      token: true,
    },
  });

  if (!account) throw new Error("Account not found");
  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        name: true,
        emailAddress: true,
      },
    });
  }),
  getNumThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let filter: Prisma.ThreadWhereInput = {};

      if (input.tab === "inbox") {
        filter = { inboxStatus: true };
      } else if (input.tab === "draft") {
        filter = { draftStatus: true };
      } else if (input.tab === "sent") {
        filter = { sentStatus: true };
      }
      return await ctx.db.thread.count({
        where: {
          accountId: account.id,
          ...filter,
        },
      });
    }),

  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      let filter: Prisma.ThreadWhereInput = {};

      if (input.tab === "inbox") {
        filter = { inboxStatus: true };
      } else if (input.tab === "draft") {
        filter = { draftStatus: true };
      } else if (input.tab === "sent") {
        filter = { sentStatus: true };
      }
      filter.done = {
        equals: input.done,
      };

      return await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails:{
            orderBy: {
              sentAt: "asc",
            },
            select:{
              id: true,
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              subject: true,
              sysLabels: true,
              sentAt: true,
            }
          }
        },
        take: 15,
        orderBy: {
          lastMessageDate: "desc",
        },
      })
    }),
});
