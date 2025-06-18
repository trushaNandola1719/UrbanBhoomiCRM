import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  alternatePhone: text("alternate_phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  occupation: text("occupation"),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  purpose: text("purpose").notNull().default("buy"), // buy, rent, lease
  budgetMin: decimal("budget_min", { precision: 12, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 12, scale: 2 }),
  propertyType: text("property_type"), // flats, bungalow, tenement, land
  preferredLocations: text("preferred_locations"), // JSON array
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  minArea: decimal("min_area", { precision: 8, scale: 2 }),
  maxArea: decimal("max_area", { precision: 8, scale: 2 }),
  furnishing: text("furnishing"), // furnished, semi-furnished, unfurnished
  parking: boolean("parking").default(false),
  amenities: text("amenities"), // JSON array of required amenities
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, inactive, follow-up, converted, closed
  assignedBrokerId: integer("assigned_broker_id").references(() => brokers.id),
  lastInteractionDate: timestamp("last_interaction_date"),
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
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: decimal("area", { precision: 8, scale: 2 }), // in sq ft
  ownerName: text("owner_name"),
  ownerContact: text("owner_contact"),
  images: text("images"), // JSON array of image URLs
  amenities: text("amenities"), // JSON array of amenities
  furnishing: text("furnishing"), // furnished, semi-furnished, unfurnished
  parking: boolean("parking").default(false),
  facing: text("facing"), // north, south, east, west, etc
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  age: integer("age"), // property age in years
  status: text("status").notNull().default("available"), // available, sold, rented
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brokers = pgTable("brokers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  alternatePhone: text("alternate_phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  affiliation: text("affiliation").notNull().default("internal"), // internal, external
  company: text("company"), // for external brokers
  experience: integer("experience"), // years of experience
  specialization: text("specialization"), // JSON array of specializations
  territory: text("territory"), // areas they cover
  commissionRate: decimal("commission_rate", { precision: 4, scale: 2 }).default("2.5"), // percentage
  totalCommission: decimal("total_commission", { precision: 10, scale: 2 }).default("0"),
  totalDeals: integer("total_deals").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"), // average rating
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  joinedDate: timestamp("joined_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer Interactions - Main tracking table
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  brokerId: integer("broker_id").references(() => brokers.id).notNull(),
  type: text("type").notNull(), // digital_sharing, follow_up, property_visit
  title: text("title").notNull(),
  description: text("description"),
  
  // For digital sharing
  sharedProperties: text("shared_properties"), // JSON array of property IDs
  shortlistedProperties: text("shortlisted_properties"), // JSON array from customer response
  
  // For property visit
  propertyId: integer("property_id").references(() => properties.id),
  visitDate: timestamp("visit_date"),
  customerFeedback: text("customer_feedback"),
  rating: integer("rating"), // 1-5 stars for property visit
  
  // Common fields
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, paused, ended
  pauseReason: text("pause_reason"),
  endReason: text("end_reason"),
  reminderSent: boolean("reminder_sent").default(false),
  lastReminderDate: timestamp("last_reminder_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property Interest tracking
export const propertyInterests = pgTable("property_interests", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  interestLevel: text("interest_level").notNull(), // high, medium, low, rejected
  source: text("source"), // digital_sharing, direct_inquiry, broker_recommendation
  interactionId: integer("interaction_id").references(() => interactions.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Legacy visits table (keeping for backward compatibility)
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

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyInterestSchema = createInsertSchema(propertyInterests).omit({
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
export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type PropertyInterest = typeof propertyInterests.$inferSelect;
export type InsertPropertyInterest = z.infer<typeof insertPropertyInterestSchema>;

// Extended types for API responses with relationships
export type VisitWithDetails = Visit & {
  customer: Customer;
  property: Property;
  broker?: Broker;
};

export type InteractionWithDetails = Interaction & {
  customer: Customer;
  broker: Broker;
  property?: Property;
};

export type CustomerWithDetails = Customer & {
  assignedBroker?: Broker;
  recentInteractions?: InteractionWithDetails[];
  interestedProperties?: PropertyInterest[];
};

export type BrokerWithStats = Broker & {
  assignedCustomers?: Customer[];
  recentInteractions?: InteractionWithDetails[];
  monthlyDeals?: number;
};
