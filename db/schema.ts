import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  category: text().notNull(),
  icon: text().notNull(),
  description: text().notNull(),
  address: text().notNull(),
  hours: text().notNull(),
  phone: text().notNull(),
  verified: text().notNull(),
  search: text().notNull(),
});

export const suggestions = pgTable("suggestions", {
  id: serial().primaryKey(),
  kind: text().notNull(),
  service: text().notNull().default(""),
  note: text().notNull(),
  email: text().notNull().default(""),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});
