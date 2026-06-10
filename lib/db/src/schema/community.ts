import { pgTable, uuid, text, integer, boolean, timestamp, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";
import { users } from "./users";

export const communityPosts = pgTable("community_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  authorId: uuid("author_id").references(() => users.id),
  content: text("content").notNull(),
  photoUrl: text("photo_url"),
  postType: text("post_type").default("general"),
  isAnonymous: boolean("is_anonymous").default(true),
  status: text("status").default("active"),
  deletedBy: uuid("deleted_by").references(() => users.id),
  deletionReason: text("deletion_reason"),
  commentCount: integer("comment_count").default(0),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("idx_posts_estate_created").on(t.estateId, t.createdAt),
]);

export const communityEvents = pgTable("community_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  createdBy: uuid("created_by").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  location: text("location"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: text("status").default("active"),
  cancelledBy: uuid("cancelled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("idx_events_estate_starts").on(t.estateId, t.startsAt),
]);

export const eventRsvps = pgTable("event_rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => communityEvents.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  response: text("response").notNull().default("yes"),
  guestCount: integer("guest_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  unique("event_rsvps_event_user_unique").on(t.eventId, t.userId),
]);

export const insertPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export const insertEventSchema = createInsertSchema(communityEvents).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type CommunityEvent = typeof communityEvents.$inferSelect;

export const insertRsvpSchema = createInsertSchema(eventRsvps).omit({ id: true, createdAt: true });
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
