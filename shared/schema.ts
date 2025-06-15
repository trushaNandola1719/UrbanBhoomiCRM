import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  preferences: text("preferences"), // JSON string for property preferences
  budgetMin: decimal("budget_min", { precision: 12, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 12, scale: 2 }),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, inactive, follow-up
  lastCallDate: timestamp("last_call_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // flats, tenement, bungalow, land
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  location: text("location").notNull(),
  address: text("address"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: decimal("area", { precision: 8, scale: 2 }), // in sq ft
  ownerName: text("owner_name"),
  ownerContact: text("owner_contact"),
  images: text("images"), // JSON array of image URLs
  amenities: text("amenities"), // JSON array of amenities
  status: text("status").notNull().default("available"), // available, sold, rented
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brokers = pgTable("brokers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  specialization: text("specialization"), // JSON array of specializations
  commissionRate: decimal("commission_rate", { precision: 4, scale: 2 }).default("2.5"), // percentage
  totalCommission: decimal("total_commission", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  brokerId: integer("broker_id").references(() => brokers.id),
  visitDate: timestamp("visit_date").notNull(),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 stars
  notes: text("notes"),
  status: text("status").notNull().default("completed"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertBrokerSchema = createInsertSchema(brokers).omit({
  id: true,
  createdAt: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  createdAt: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Broker = typeof brokers.$inferSelect;
export type InsertBroker = z.infer<typeof insertBrokerSchema>;
export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;

// Extended types for API responses with relationships
export type VisitWithDetails = Visit & {
  customer: Customer;
  property: Property;
  broker?: Broker;
};
