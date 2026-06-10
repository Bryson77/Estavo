import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";
import { users } from "./users";

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  emergencyRef: text("emergency_ref"),
  triggeredBy: uuid("triggered_by").references(() => users.id),
  triggerType: text("trigger_type").default("resident"),
  unitNumber: text("unit_number"),
  status: text("status").default("active"),
  acknowledgedBy: uuid("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  resolutionNote: text("resolution_note"),
  falseAlarmFlaggedBy: uuid("false_alarm_flagged_by").references(() => users.id),
  falseAlarmFlaggedAt: timestamp("false_alarm_flagged_at", { withTimezone: true }),
  falseAlarmReason: text("false_alarm_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("idx_emergency_estate_status").on(t.estateId, t.status),
]);

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).omit({ id: true, createdAt: true });
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
