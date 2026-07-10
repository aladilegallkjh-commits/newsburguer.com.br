import { integer, real, text, sqliteTable } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table - Stores all customer orders
 */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("orderNumber").notNull().unique(),
  customerId: text("customerId").notNull(),
  customerName: text("customerName").notNull(),
  customerPhone: text("customerPhone").notNull(),
  
  items: text("items", { mode: "json" }).notNull(),
  totalAmount: real("totalAmount").notNull(),
  discount: real("discount").default(0),
  couponId: integer("couponId"),
  finalAmount: real("finalAmount").notNull(),
  
  deliveryType: text("deliveryType", { enum: ["delivery", "pickup"] }).notNull(),
  address: text("address"),
  notes: text("notes"),
  
  driverId: integer("driverId"),
  
  status: text("status", { enum: ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] }).default("pending").notNull(),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  estimatedDeliveryTime: integer("estimatedDeliveryTime", { mode: "timestamp" }),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  removedIngredients?: string[];
  addedExtras?: {
    name: string;
    price: number;
  }[];
  observations?: string;
}

/**
 * Order status history - Tracks all status changes for an order
 */
export const orderStatusHistory = sqliteTable("orderStatusHistory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] }).notNull(),
  message: text("message"),
  timestamp: integer("timestamp", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = typeof orderStatusHistory.$inferInsert;

/**
 * Notifications - Stores notifications sent to customers
 */
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull(),
  customerPhone: text("customerPhone").notNull(),
  type: text("type", { enum: ["order_received", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] }).notNull(),
  message: text("message").notNull(),
  sentVia: text("sentVia", { enum: ["whatsapp", "sms", "email"] }).default("whatsapp"),
  sentAt: integer("sentAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  status: text("status", { enum: ["pending", "sent", "failed"] }).default("pending"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Coupon codes - For discount management
 */
export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  discountType: text("discountType", { enum: ["percentage", "fixed"] }).notNull(),
  discountValue: real("discountValue").notNull(),
  maxUses: integer("maxUses"),
  currentUses: integer("currentUses").default(0),
  minOrderAmount: real("minOrderAmount"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  isActive: integer("isActive").default(1),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * Customers - Stores customer information for ranking
 */
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  totalOrders: integer("totalOrders").default(0),
  totalSpent: real("totalSpent").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Customer Rankings - Tracks ranking positions
 */
export const customerRankings = sqliteTable("customerRankings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customerId").notNull(),
  period: text("period", { enum: ["week", "month"] }).notNull(),
  position: integer("position").notNull(),
  orderCount: integer("orderCount").notNull(),
  totalSpent: real("totalSpent").notNull(),
  prizeWon: text("prizeWon", { enum: ["hamburger_kids", "combo_free", "none"] }).default("none"),
  prizeClaimedAt: integer("prizeClaimedAt", { mode: "timestamp" }),
  calculatedAt: integer("calculatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type CustomerRanking = typeof customerRankings.$inferSelect;
export type InsertCustomerRanking = typeof customerRankings.$inferInsert;

/**
 * Prize Codes - Unique codes for prizes won
 */
export const prizeCodes = sqliteTable("prizeCodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  prizeType: text("prizeType", { enum: ["hamburger_kids", "combo_free"] }).notNull(),
  customerId: integer("customerId").notNull(),
  customerPhone: text("customerPhone").notNull(),
  period: text("period").notNull(),
  isUsed: integer("isUsed").default(0),
  usedAt: integer("usedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});

export type PrizeCode = typeof prizeCodes.$inferSelect;
export type InsertPrizeCode = typeof prizeCodes.$inferInsert;

/**
 * Store Settings - Configuration for the restaurant
 */
export const storeSettings = sqliteTable("storeSettings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  storeName: text("storeName").notNull().default("New S'Burguer"),
  whatsappNumber: text("whatsappNumber").notNull().default("41987019702"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zipCode"),
  openingTime: text("openingTime"),
  closingTime: text("closingTime"),
  isOpen: integer("isOpen").default(1),
  logoUrl: text("logoUrl"),
  bannerUrl: text("bannerUrl"),
  description: text("description"),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = typeof storeSettings.$inferInsert;

/**
 * Menu Items - Products available in the store
 */
export const menuItems = sqliteTable("menuItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category", { enum: ["hamburgers", "hotdogs", "combos", "drinks", "extras"] }).notNull(),
  price: real("price").notNull(),
  imageUrl: text("imageUrl"),
  ingredients: text("ingredients", { mode: "json" }),
  extras: text("extras", { mode: "json" }),
  isActive: integer("isActive").default(1),
  displayOrder: integer("displayOrder").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Promotions - Special offers and discounts
 */
export const promotions = sqliteTable("promotions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: ["percentage", "fixed", "combo"] }).notNull(),
  discountValue: real("discountValue").notNull(),
  minOrderAmount: real("minOrderAmount"),
  imageUrl: text("imageUrl"),
  isActive: integer("isActive").default(1),
  startDate: integer("startDate", { mode: "timestamp" }),
  endDate: integer("endDate", { mode: "timestamp" }),
  displayOrder: integer("displayOrder").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * Admin Users - Separate from OAuth users for admin panel
 */
export const adminUsers = sqliteTable("adminUsers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["owner", "manager", "staff"] }).default("staff").notNull(),
  isActive: integer("isActive").default(1),
  lastLoginAt: integer("lastLoginAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

/**
 * WhatsApp Settings - Configuration for automated WhatsApp notifications
 */
export const whatsappSettings = sqliteTable("whatsappSettings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminUserId: integer("adminUserId").notNull(),
  
  phoneNumber: text("phoneNumber").notNull(),
  apiKey: text("apiKey"),
  
  enableDailySummary: integer("enableDailySummary").default(1),
  summaryTime: text("summaryTime").notNull().default('09:00'),
  
  enableSalesAlerts: integer("enableSalesAlerts").default(1),
  salesAlertThreshold: real("salesAlertThreshold").default(10),
  
  enableOrderAlerts: integer("enableOrderAlerts").default(1),
  enableLowStockAlerts: integer("enableLowStockAlerts").default(0),
  
  includeGraphs: integer("includeGraphs").default(1),
  includeTopProducts: integer("includeTopProducts").default(1),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type WhatsappSettings = typeof whatsappSettings.$inferSelect;
export type InsertWhatsappSettings = typeof whatsappSettings.$inferInsert;

/**
 * WhatsApp Messages Log - Track sent messages
 */
export const whatsappMessagesLog = sqliteTable("whatsappMessagesLog", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminUserId: integer("adminUserId").notNull(),
  
  messageType: text("messageType", { enum: ["daily_summary", "sales_alert", "order_alert", "custom"] }).notNull(),
  phoneNumber: text("phoneNumber").notNull(),
  messageContent: text("messageContent").notNull(),
  
  status: text("status", { enum: ["pending", "sent", "failed"] }).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  
  sentAt: integer("sentAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type WhatsappMessagesLog = typeof whatsappMessagesLog.$inferSelect;
export type InsertWhatsappMessagesLog = typeof whatsappMessagesLog.$inferInsert;

/**
 * Ratings - Stores customer ratings
 */
export const ratings = sqliteTable("ratings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull(),
  customerId: text("customerId").notNull(),
  customerName: text("customerName").notNull(),
  customerPhone: text("customerPhone").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});
