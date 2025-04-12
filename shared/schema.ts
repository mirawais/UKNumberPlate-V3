import { pgTable, text, serial, integer, boolean, timestamp, json, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  isAdmin: true,
});

// Site configuration for dynamic site settings
export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  configKey: text("config_key").notNull().unique(),
  configValue: text("config_value").notNull(),
  configType: text("config_type").notNull(), // text, color, image, json
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteConfigSchema = createInsertSchema(siteConfig).omit({
  id: true,
  updatedAt: true,
});

// Navigation menu items
export const navigationItems = pgTable("navigation_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  orderIndex: numeric("order_index").notNull(),
  parentId: numeric("parent_id"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertNavigationItemSchema = createInsertSchema(navigationItems).omit({
  id: true,
});

// Dynamic content blocks for editable text
export const contentBlocks = pgTable("content_blocks", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  location: text("location").notNull(), // header, footer, home, etc.
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContentBlockSchema = createInsertSchema(contentBlocks).omit({
  id: true,
  updatedAt: true,
});

// Uploaded files for storing images and documents
export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: numeric("file_size").notNull(),
  filePath: text("file_path").notNull(), // Path to the stored file
  fileData: text("file_data"), // For storing base64 encoded small files or binary data as text
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  fileType: text("file_type").notNull(), // logo, badge, car-brand, document, etc.
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles);

// Plate sizes configuration
export const plateSizes = pgTable("plate_sizes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dimensions: text("dimensions").notNull(),
  additionalPrice: numeric("additional_price").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  description: text("description"),
  displayOrder: numeric("display_order").default("0"),
});

export const insertPlateSizeSchema = createInsertSchema(plateSizes).omit({
  id: true,
});

// Text styles configuration
export const textStyles = pgTable("text_styles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"), // Kept for backwards compatibility 
  imageFileId: numeric("image_file_id"), // Reference to uploaded file
  additionalPrice: numeric("additional_price").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: numeric("display_order").default("0"),
});

export const insertTextStyleSchema = createInsertSchema(textStyles).omit({
  id: true,
});

// Badge options configuration
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imagePath: text("image_path").notNull(), // Kept for backwards compatibility
  imageFileId: numeric("image_file_id"), // Reference to uploaded file
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: numeric("display_order").default("0"),
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
  displayOrder: numeric("display_order").default("0"),
});

export const insertColorSchema = createInsertSchema(colors).omit({
  id: true,
});

// Car brands for plate surrounds
export const carBrands = pgTable("car_brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoPath: text("logo_path"), // Kept for backwards compatibility
  logoFileId: numeric("logo_file_id"), // Reference to uploaded file
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: numeric("display_order").default("0"),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPricingSchema = createInsertSchema(pricing).omit({
  id: true,
  updatedAt: true,
});

// Payment methods configuration
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  iconPath: text("icon_path"), // Kept for backwards compatibility
  iconFileId: numeric("icon_file_id"), // Reference to uploaded file
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: numeric("display_order").default("0"),
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
  plateDetails: jsonb("plate_details").notNull(), // JSON data with all plate customization options
  totalPrice: numeric("total_price").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  orderStatus: text("order_status").default("pending").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"), // To track Stripe payment intent
  documentFileId: numeric("document_file_id"), // Reference to uploaded vehicle document for road legal plates
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  stripePaymentIntentId: true, // Will be added after payment intent creation
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;
export type SiteConfig = typeof siteConfig.$inferSelect;

export type InsertNavigationItem = z.infer<typeof insertNavigationItemSchema>;
export type NavigationItem = typeof navigationItems.$inferSelect;

export type InsertContentBlock = z.infer<typeof insertContentBlockSchema>;
export type ContentBlock = typeof contentBlocks.$inferSelect;

export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;

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
  documentFile?: File | null; // For storing the uploaded document for road legal plates
  customFont?: string; // Font name to use for plate text rendering
};
