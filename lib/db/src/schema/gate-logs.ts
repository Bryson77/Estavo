import { pgTable, uuid, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";
import { users } from "./users";

export const gateLogs = pgTable("gate_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  gateId: text("gate_id").notNull(),
  gateLabel: text("gate_label").notNull(),
  gateGroupId: text("gate_group_id"),
  gateGroupLabel: text("gate_group_label"),
  triggeredBy: uuid("triggered_by").references(() => users.id),
  triggerType: text("trigger_type").notNull().default("resident"),
  unitNumber: text("unit_number"),
  actorName: text("actor_name"),
  direction: text("direction"),
  status: text("status").default("success"),
  hardwareResponseMs: integer("hardware_response_ms"),
  offlineValidated: boolean("offline_validated").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("idx_gate_logs_estate_created").on(t.estateId, t.createdAt),
  index("idx_gate_logs_estate_gate").on(t.estateId, t.gateId),
]);

export const insertGateLogSchema = createInsertSchema(gateLogs).omit({ id: true, createdAt: true });
export type InsertGateLog = z.infer<typeof insertGateLogSchema>;
export type GateLog = typeof gateLogs.$inferSelect;
