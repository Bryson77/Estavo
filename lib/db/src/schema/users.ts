import { pgTable, uuid, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default("resident"),
  unitNumber: text("unit_number"),
  status: text("status").default("active"),
  accountStanding: text("account_standing").default("good"),
  emergencyStrikes: integer("emergency_strikes").default(0),
  emergencySuspendedUntil: timestamp("emergency_suspended_until", { withTimezone: true }),
  firstLogin: boolean("first_login").default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  pushToken: text("push_token"),
  pushTokenUpdatedAt: timestamp("push_token_updated_at", { withTimezone: true }),
  unitChangeLog: jsonb("unit_change_log").default([]),
  passwordHash: text("password_hash"),
  otpCode: text("otp_code"),
  otpExpiresAt: timestamp("otp_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
