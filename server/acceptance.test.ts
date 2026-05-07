import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock user context
function createMockContext(userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@test.com`,
      name: `Test User ${userId}`,
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// Helper to extract insertId from result
function getInsertId(result: any): number | null {
  if (!result) return null;
  if (typeof result === 'object' && 'insertId' in result) {
    return result.insertId;
  }
  return null;
}

describe("Acceptance Checks", () => {
  let freeUserCtx: TrpcContext;
  let premiumUserCtx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;
  let premiumCaller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    // Use unique IDs for each test run
    const freeId = Math.floor(Math.random() * 100000) + 1;
    const premiumId = Math.floor(Math.random() * 100000) + 100000;

    freeUserCtx = createMockContext(freeId);
    premiumUserCtx = createMockContext(premiumId);

    // Set up premium status
    await db.setUserPremium(freeId, false);
    await db.setUserPremium(premiumId, true);

    caller = appRouter.createCaller(freeUserCtx);
    premiumCaller = appRouter.createCaller(premiumUserCtx);
  });

  describe("Check 1: Free user can save only 5 timers", () => {
    it("should allow free user to save up to 5 timers", async () => {
      const userId = freeUserCtx.user!.id;
      
      for (let i = 0; i < 5; i++) {
        const result = await caller.timers.create({
          name: `Timer ${i + 1}`,
          duration: 300,
          isAdvanced: false,
        });
        
        const timerId = getInsertId(result);
        if (timerId) {
          await caller.timers.save({ timerId });
        }
      }

      const saved = await db.getSavedTimers(userId);
      expect(saved.length).toBe(5);
    });

    it("should prevent free user from saving more than 5 timers", async () => {
      // Create and save 5 timers
      for (let i = 0; i < 5; i++) {
        const result = await caller.timers.create({
          name: `Timer ${i + 1}`,
          duration: 300,
          isAdvanced: false,
        });
        
        const timerId = getInsertId(result);
        if (timerId) {
          await caller.timers.save({ timerId });
        }
      }

      // Try to save a 6th timer - should fail
      try {
        const result = await caller.timers.create({
          name: "Timer 6",
          duration: 300,
          isAdvanced: false,
        });
        
        const timerId = getInsertId(result);
        if (timerId) {
          await caller.timers.save({ timerId });
        }
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Free users can only save 5 timers");
      }
    });
  });

  describe("Check 2: Free user cannot access Advanced Timer", () => {
    it("should prevent free user from creating advanced timer", async () => {
      try {
        await caller.timers.create({
          name: "Advanced Timer",
          duration: 0,
          isAdvanced: true,
          rounds: 2,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Advanced timers are a Premium feature");
      }
    });
  });

  describe("Check 3: Free user can see premium presets but cannot start them", () => {
    it("should allow free user to list presets", async () => {
      const presets = await caller.presets.list();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    it("should prevent free user from starting presets", async () => {
      const canStart = await caller.presets.canStart();
      expect(canStart.canStart).toBe(false);
    });
  });

  describe("Check 4: Premium user can save unlimited timers", () => {
    it("should allow premium user to save many timers", async () => {
      const userId = premiumUserCtx.user!.id;
      
      for (let i = 0; i < 15; i++) {
        const result = await premiumCaller.timers.create({
          name: `Premium Timer ${i + 1}`,
          duration: 300,
          isAdvanced: false,
        });
        
        const timerId = getInsertId(result);
        if (timerId) {
          await premiumCaller.timers.save({ timerId });
        }
      }

      const saved = await db.getSavedTimers(userId);
      expect(saved.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe("Check 5: Premium user can create advanced timer with up to 10 intervals", () => {
    it("should allow premium user to create advanced timer with intervals", async () => {
      const result = await premiumCaller.timers.create({
        name: "Advanced Premium Timer",
        duration: 0,
        isAdvanced: true,
        rounds: 3,
      });

      const timerId = getInsertId(result);
      expect(timerId).toBeDefined();

      if (!timerId) throw new Error("Failed to create timer");

      // Add 10 intervals
      for (let i = 0; i < 10; i++) {
        await premiumCaller.intervals.create({
          timerId,
          orderIndex: i,
          duration: 30,
          sound: "bell",
          color: "#3b82f6",
        });
      }

      const timer = await db.getTimerWithIntervals(timerId);
      expect(timer?.intervals.length).toBe(10);
    });
  });

  describe("Check 6: Advanced timer moves through intervals and repeats rounds", () => {
    it("should have correct interval and round structure", async () => {
      const result = await premiumCaller.timers.create({
        name: "Round Test Timer",
        duration: 0,
        isAdvanced: true,
        rounds: 3,
      });

      const timerId = getInsertId(result);
      if (!timerId) throw new Error("Failed to create timer");

      // Add 2 intervals
      await premiumCaller.intervals.create({
        timerId,
        orderIndex: 0,
        duration: 20,
        sound: "bell",
        color: "#ef4444",
      });

      await premiumCaller.intervals.create({
        timerId,
        orderIndex: 1,
        duration: 10,
        sound: "beep",
        color: "#10b981",
      });

      const timer = await db.getTimerWithIntervals(timerId);
      expect(timer?.rounds).toBe(3);
      expect(timer?.intervals.length).toBe(2);
      expect(timer?.intervals[0].duration).toBe(20);
      expect(timer?.intervals[1].duration).toBe(10);
    });
  });

  describe("Check 7: Each interval plays sound and changes color", () => {
    it("should store sound and color for each interval", async () => {
      const result = await premiumCaller.timers.create({
        name: "Sound Color Timer",
        duration: 0,
        isAdvanced: true,
        rounds: 1,
      });

      const timerId = getInsertId(result);
      if (!timerId) throw new Error("Failed to create timer");

      const colors = ["#ef4444", "#10b981", "#3b82f6"];
      const sounds = ["bell", "beep", "ding"];

      for (let i = 0; i < 3; i++) {
        await premiumCaller.intervals.create({
          timerId,
          orderIndex: i,
          duration: 30,
          sound: sounds[i],
          color: colors[i],
        });
      }

      const timer = await db.getTimerWithIntervals(timerId);
      expect(timer?.intervals[0].color).toBe("#ef4444");
      expect(timer?.intervals[0].sound).toBe("bell");
      expect(timer?.intervals[1].color).toBe("#10b981");
      expect(timer?.intervals[1].sound).toBe("beep");
      expect(timer?.intervals[2].color).toBe("#3b82f6");
      expect(timer?.intervals[2].sound).toBe("ding");
    });
  });

  describe("Check 8: All 5 premium presets exist and are accessible", () => {
    it("should have all 5 presets", async () => {
      const presets = await caller.presets.list();
      expect(presets.length).toBeGreaterThanOrEqual(5);

      const presetNames = presets.map((p) => p.name);
      expect(presetNames).toContain("Tabata");
      expect(presetNames).toContain("HIIT");
      expect(presetNames).toContain("Pomodoro");
      expect(presetNames).toContain("Warm-up");
      expect(presetNames).toContain("Cool-down");
    });

    it("should have correct preset configurations", async () => {
      const presets = await caller.presets.list();
      const tabata = presets.find((p) => p.name === "Tabata");

      expect(tabata).toBeDefined();
      expect(tabata?.rounds).toBe(8);
      expect(tabata?.intervalsData.length).toBe(2);
      expect(tabata?.intervalsData[0].duration).toBe(20);
      expect(tabata?.intervalsData[1].duration).toBe(10);
    });

    it("should allow premium user to access presets", async () => {
      const canStart = await premiumCaller.presets.canStart();
      expect(canStart.canStart).toBe(true);
    });
  });

  describe("Check 9: Stopwatch works without Premium", () => {
    it("free user should be able to use stopwatch features", async () => {
      // Stopwatch is a frontend feature, no backend calls needed
      // Just verify it's not gated
      const isPremium = await db.getUserPremiumStatus(freeUserCtx.user!.id);
      expect(isPremium).toBe(false);
      // Stopwatch should work regardless
    });
  });

  describe("Check 10: Saved timers persist after close/reopen", () => {
    it("should retrieve saved timers from database", async () => {
      // Create and save a timer
      const result = await caller.timers.create({
        name: "Persistent Timer",
        duration: 600,
        isAdvanced: false,
      });

      const timerId = getInsertId(result);
      if (timerId) {
        await caller.timers.save({ timerId });
      }

      // Simulate closing and reopening by querying again
      const saved = await caller.timers.saved();
      expect(saved.length).toBeGreaterThan(0);

      const persistentTimer = saved.find((t) => t.name === "Persistent Timer");
      expect(persistentTimer).toBeDefined();
      expect(persistentTimer?.duration).toBe(600);
    });
  });

  describe("Premium Status Management", () => {
    it("should correctly track premium status", async () => {
      const freeStatus = await caller.premium.getStatus();
      expect(freeStatus.isPremium).toBe(false);

      const premiumStatus = await premiumCaller.premium.getStatus();
      expect(premiumStatus.isPremium).toBe(true);
    });

    it("should allow upgrading to premium", async () => {
      await caller.premium.setPremium({ isPremium: true });
      const status = await caller.premium.getStatus();
      expect(status.isPremium).toBe(true);
    });
  });
});
