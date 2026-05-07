import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Premium subscription status for users
 */
export const userPremium = mysqlTable("user_premium", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPremium = typeof userPremium.$inferSelect;
export type InsertUserPremium = typeof userPremium.$inferInsert;

/**
 * Saved timers for users
 */
export const timers = mysqlTable("timers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  duration: int("duration").notNull(), // in seconds, for simple timer
  isAdvanced: boolean("is_advanced").default(false).notNull(),
  rounds: int("rounds").default(1).notNull(), // for advanced timer
  isSaved: boolean("is_saved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Timer = typeof timers.$inferSelect;
export type InsertTimer = typeof timers.$inferInsert;

/**
 * Intervals for advanced timers
 */
export const intervals = mysqlTable("intervals", {
  id: int("id").autoincrement().primaryKey(),
  timerId: int("timer_id").notNull(),
  orderIndex: int("order_index").notNull(),
  duration: int("duration").notNull(), // in seconds
  sound: varchar("sound", { length: 50 }).default("bell").notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6").notNull(), // hex color
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Interval = typeof intervals.$inferSelect;
export type InsertInterval = typeof intervals.$inferInsert;

/**
 * Premium preset timers
 */
export const presets = mysqlTable("presets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  intervalsData: json("intervals_data").$type<Array<{
    duration: number;
    sound: string;
    color: string;
  }>>().notNull(),
  rounds: int("rounds").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Preset = typeof presets.$inferSelect;
export type InsertPreset = typeof presets.$inferInsert;
