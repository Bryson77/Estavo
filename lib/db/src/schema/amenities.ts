import { pgTable, uuid, text, integer, boolean, time, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";
import { users } from "./users";

export const amenities = pgTable("amenities", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  name: text("name").notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  slotDurationMins: integer("slot_duration_mins").default(60),
  availableDays: text("available_days").array(),
  availableFrom: time("available_from").default("08:00"),
  availableUntil: time("available_until").default("20:00"),
  maxConcurrent: integer("max_concurrent").default(1),
  maxBookingsPerUnitPerWeek: integer("max_bookings_per_unit_per_week").default(2),
  cancellationPolicy: text("cancellation_policy").default("anytime"),
  waitlistEnabled: boolean("waitlist_enabled").default(false),
  damageReportingEnabled: boolean("damage_reporting_enabled").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("idx_amenities_estate").on(t.estateId, t.isActive),
]);

export const amenityBookings = pgTable("amenity_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  amenityId: uuid("amenity_id").notNull().references(() => amenities.id),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  residentId: uuid("resident_id").notNull().references(() => users.id),
  slotStart: timestamp("slot_start", { withTimezone: true }).notNull(),
  slotEnd: timestamp("slot_end", { withTimezone: true }).notNull(),
  status: text("status").default("confirmed"),
  cancelledBy: uuid("cancelled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
  damageReported: boolean("damage_reported").default(false),
  damageDescription: text("damage_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("idx_bookings_amenity_slot").on(t.amenityId, t.slotStart),
  index("idx_bookings_resident").on(t.residentId),
]);

export const insertAmenitySchema = createInsertSchema(amenities).omit({ id: true, createdAt: true });
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;
export type Amenity = typeof amenities.$inferSelect;

export const insertBookingSchema = createInsertSchema(amenityBookings).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type AmenityBooking = typeof amenityBookings.$inferSelect;
