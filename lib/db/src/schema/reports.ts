import { pgTable, uuid, text, integer, boolean, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";
import { users } from "./users";

export const maintenanceReports = pgTable("maintenance_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  ticketNumber: text("ticket_number"),
  submittedBy: uuid("submitted_by").references(() => users.id),
  unitNumber: text("unit_number"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  aiCategory: text("ai_category"),
  aiClassification: text("ai_classification"),
  aiClassificationConfidence: numeric("ai_classification_confidence", { precision: 3, scale: 2 }),
  photoUrl: text("photo_url"),
  photoThumbnailUrl: text("photo_thumbnail_url"),
  category: text("category").default("maintenance"),
  priority: text("priority").default("medium"),
  status: text("status").default("open"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  escalationLevel: integer("escalation_level").default(0),
  escalatedAt: timestamp("escalated_at", { withTimezone: true }),
  duplicateOf: uuid("duplicate_of"),
  voteCount: integer("vote_count").default(0),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  residentConfirmedResolved: boolean("resident_confirmed_resolved"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("idx_reports_estate_status").on(t.estateId, t.status),
  index("idx_reports_assigned").on(t.assignedTo),
  index("idx_reports_estate_created").on(t.estateId, t.createdAt),
]);

export const reportStatusHistory = pgTable("report_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => maintenanceReports.id),
  status: text("status").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  note: text("note"),
  isInternal: boolean("is_internal").default(false),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertReportSchema = createInsertSchema(maintenanceReports).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof maintenanceReports.$inferSelect;

export const insertReportHistorySchema = createInsertSchema(reportStatusHistory).omit({ id: true, createdAt: true });
export type InsertReportHistory = z.infer<typeof insertReportHistorySchema>;
export type ReportHistory = typeof reportStatusHistory.$inferSelect;
