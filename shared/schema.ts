import { pgTable, text, serial, integer, boolean, timestamp, json, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Plate sizes configuration
export const plateSizes = pgTable("plate_sizes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dimensions: text("dimensions").notNull(),
  additionalPrice: numeric("additional_price").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertPlateSizeSchema = createInsertSchema(plateSizes).omit({
  id: true,
});

// Text styles configuration
export const textStyles = pgTable("text_styles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"),
  additionalPrice: numeric("additional_price").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertTextStyleSchema = createInsertSchema(textStyles).omit({
  id: true,
});

// Badge options configuration
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), 
  imagePath: text("image_path").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});

// Color options configuration
export const colors = pgTable("colors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hexCode: text("hex_code").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertColorSchema = createInsertSchema(colors).omit({
  id: true,
});

// Car brands for plate surrounds
export const carBrands = pgTable("car_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertCarBrandSchema = createInsertSchema(carBrands).omit({
  id: true,
});

// Global pricing configuration
export const pricing = pgTable("pricing", {
  id: serial("id").primaryKey(),
  frontPlatePrice: numeric("front_plate_price").notNull(),
  rearPlatePrice: numeric("rear_plate_price").notNull(),
  bothPlatesDiscount: numeric("both_plates_discount").default("0").notNull(),
  taxRate: numeric("tax_rate").default("20").notNull(), // VAT percentage
});

export const insertPricingSchema = createInsertSchema(pricing).omit({
  id: true,
});

// Payment methods configuration
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
});

// Customer orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  plateDetails: json("plate_details").notNull(), // JSON data with all plate customization options
  totalPrice: numeric("total_price").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  orderStatus: text("order_status").default("pending").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"), // To track Stripe payment intent
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  stripePaymentIntentId: true, // Will be added after payment intent creation
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlateSize = z.infer<typeof insertPlateSizeSchema>;
export type PlateSize = typeof plateSizes.$inferSelect;

export type InsertTextStyle = z.infer<typeof insertTextStyleSchema>;
export type TextStyle = typeof textStyles.$inferSelect;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export type InsertColor = z.infer<typeof insertColorSchema>;
export type Color = typeof colors.$inferSelect;

export type InsertCarBrand = z.infer<typeof insertCarBrandSchema>;
export type CarBrand = typeof carBrands.$inferSelect;

export type InsertPricing = z.infer<typeof insertPricingSchema>;
export type Pricing = typeof pricing.$inferSelect;

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Type for plate customization (used for state management)
export type PlateCustomization = {
  plateType: 'both' | 'front' | 'rear';
  registrationText: string;
  plateSize: string;
  textStyle: string;
  textColor: string;
  badge: string;
  borderColor: string;
  carBrand: string;
  isRoadLegal: boolean;
};
