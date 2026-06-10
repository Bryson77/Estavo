import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";
import { users } from "./users";

export const managementBroadcasts = pgTable("management_broadcasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  sentBy: uuid("sent_by").notNull().references(() => users.id),
  messageType: text("message_type").default("broadcast"),
  targetUnitNumber: text("target_unit_number"),
  targetUserId: uuid("target_user_id").references(() => users.id),
  subject: text("subject"),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  deliveryChannel: text("delivery_channel").array().default(["push", "email"]),
  pushDeliveredCount: integer("push_delivered_count").default(0),
  emailDeliveredCount: integer("email_delivered_count").default(0),
  deliveryFailed: boolean("delivery_failed").default(false),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertBroadcastSchema = createInsertSchema(managementBroadcasts).omit({ id: true, createdAt: true });
export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;
export type ManagementBroadcast = typeof managementBroadcasts.$inferSelect;
