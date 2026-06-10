import { pgTable, uuid, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";
import { users } from "./users";

export const guestCodes = pgTable("guest_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  unitId: uuid("unit_id").references(() => users.id),
  guestFirstName: text("guest_first_name").notNull(),
  guestLastName: text("guest_last_name").notNull(),
  guestPhone: text("guest_phone"),
  isParcel: boolean("is_parcel").default(false),
  pinCode: text("pin_code").notNull(),
  qrPayload: text("qr_payload").notNull(),
  validFrom: timestamp("valid_from", { withTimezone: true }).defaultNow(),
  validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
  usesTotal: integer("uses_total").default(3),
  usesRemaining: integer("uses_remaining").default(3),
  extensionCount: integer("extension_count").default(0),
  isActive: boolean("is_active").default(true),
  whatsappSent: boolean("whatsapp_sent").default(false),
  whatsappFailed: boolean("whatsapp_failed").default(false),
  whatsappFailureReason: text("whatsapp_failure_reason"),
  parcelConfirmed: boolean("parcel_confirmed").default(false),
  parcelConfirmedBy: uuid("parcel_confirmed_by").references(() => users.id),
  parcelConfirmedAt: timestamp("parcel_confirmed_at", { withTimezone: true }),
  deactivatedBy: uuid("deactivated_by").references(() => users.id),
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("idx_guest_codes_estate_active").on(t.estateId, t.isActive),
  index("idx_guest_codes_pin").on(t.estateId, t.pinCode),
  index("idx_guest_codes_unit").on(t.unitId),
]);

export const insertGuestCodeSchema = createInsertSchema(guestCodes).omit({ id: true, createdAt: true });
export type InsertGuestCode = z.infer<typeof insertGuestCodeSchema>;
export type GuestCode = typeof guestCodes.$inferSelect;
