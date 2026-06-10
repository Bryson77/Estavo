import { pgTable, uuid, text, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { estates } from "./estates";

export const contractors = pgTable("contractors", {
  id: uuid("id").primaryKey().defaultRandom(),
  estateId: uuid("estate_id").notNull().references(() => estates.id),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  tradeCategories: text("trade_categories").array(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  ratingSum: integer("rating_sum").default(0),
  ratingCount: integer("rating_count").default(0),
  jobCount: integer("job_count").default(0),
  avgResponseMins: integer("avg_response_mins"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertContractorSchema = createInsertSchema(contractors).omit({ id: true, createdAt: true });
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Contractor = typeof contractors.$inferSelect;
