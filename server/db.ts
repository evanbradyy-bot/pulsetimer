import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, timers, intervals, presets, userPremium } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Premium status helpers
export async function getUserPremiumStatus(userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(userPremium).where(eq(userPremium.userId, userId)).limit(1);
  return result.length > 0 ? result[0].isPremium : false;
}

export async function setUserPremium(userId: number, isPremium: boolean) {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(userPremium).where(eq(userPremium.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    await db.update(userPremium).set({ isPremium }).where(eq(userPremium.userId, userId));
  } else {
    await db.insert(userPremium).values({ userId, isPremium });
  }
}

// Timer helpers
export async function getUserTimers(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(timers).where(eq(timers.userId, userId));
}

export async function getSavedTimers(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(timers).where(and(eq(timers.userId, userId), eq(timers.isSaved, true)));
}

export async function createTimer(userId: number, name: string, duration: number, isAdvanced: boolean = false, rounds: number = 1) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(timers).values({
    userId,
    name,
    duration,
    isAdvanced,
    rounds,
    isSaved: false,
  });

  // Return the inserted ID
  return { insertId: (result as any).insertId };
}

export async function saveTimer(timerId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(timers).set({ isSaved: true }).where(eq(timers.id, timerId));
}

export async function deleteTimer(timerId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(timers).where(eq(timers.id, timerId));
}

export async function getTimerWithIntervals(timerId: number) {
  const db = await getDb();
  if (!db) return null;

  const timer = await db.select().from(timers).where(eq(timers.id, timerId)).limit(1);
  if (!timer.length) return null;

  const timerIntervals = await db.select().from(intervals).where(eq(intervals.timerId, timerId));

  return { ...timer[0], intervals: timerIntervals };
}

// Interval helpers
export async function createInterval(timerId: number, orderIndex: number, duration: number, sound: string, color: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(intervals).values({
    timerId,
    orderIndex,
    duration,
    sound,
    color,
  });

  return { insertId: (result as any).insertId };
}

export async function deleteTimerIntervals(timerId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(intervals).where(eq(intervals.timerId, timerId));
}

// Preset helpers
export async function getAllPresets() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(presets);
}

export async function createPreset(name: string, description: string, intervalsData: Array<{ duration: number; sound: string; color: string }>, rounds: number = 1) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(presets).values({
    name,
    description,
    intervalsData,
    rounds,
  });

  return { insertId: (result as any).insertId };
}
