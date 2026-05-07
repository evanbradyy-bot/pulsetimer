import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Premium tier management
  premium: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const isPremium = await db.getUserPremiumStatus(ctx.user.id);
      return { isPremium };
    }),

    setPremium: protectedProcedure
      .input(z.object({ isPremium: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await db.setUserPremium(ctx.user.id, input.isPremium);
        return { success: true };
      }),
  }),

  // Timer management
  timers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTimers(ctx.user.id);
    }),

    saved: protectedProcedure.query(async ({ ctx }) => {
      return db.getSavedTimers(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        duration: z.number().nonnegative(),
        isAdvanced: z.boolean().optional(),
        rounds: z.number().positive().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const isPremium = await db.getUserPremiumStatus(ctx.user.id);

        // Free users cannot create advanced timers
        if (!isPremium && input.isAdvanced) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Advanced timers are a Premium feature.",
          });
        }

        const result = await db.createTimer(
          ctx.user.id,
          input.name,
          input.duration,
          input.isAdvanced || false,
          input.rounds || 1
        );

        return result;
      }),

    save: protectedProcedure
      .input(z.object({ timerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isPremium = await db.getUserPremiumStatus(ctx.user.id);
        const savedCount = (await db.getSavedTimers(ctx.user.id)).length;

        if (!isPremium && savedCount >= 5) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free users can only save 5 timers. Upgrade to Premium for unlimited timers.",
          });
        }

        await db.saveTimer(input.timerId);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ timerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTimer(input.timerId);
        return { success: true };
      }),

    getWithIntervals: protectedProcedure
      .input(z.object({ timerId: z.number() }))
      .query(async ({ input }) => {
        return db.getTimerWithIntervals(input.timerId);
      }),
  }),

  // Intervals management
  intervals: router({
    create: protectedProcedure
      .input(z.object({
        timerId: z.number(),
        orderIndex: z.number(),
        duration: z.number().positive().min(1),
        sound: z.string(),
        color: z.string(),
      }))
      .mutation(async ({ input }) => {
        return db.createInterval(
          input.timerId,
          input.orderIndex,
          input.duration,
          input.sound,
          input.color
        );
      }),

    deleteAll: protectedProcedure
      .input(z.object({ timerId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTimerIntervals(input.timerId);
        return { success: true };
      }),
  }),

  // Presets
  presets: router({
    list: publicProcedure.query(async () => {
      return db.getAllPresets();
    }),

    canStart: protectedProcedure.query(async ({ ctx }) => {
      const isPremium = await db.getUserPremiumStatus(ctx.user.id);
      return { canStart: isPremium };
    }),
  }),
});

export type AppRouter = typeof appRouter;
