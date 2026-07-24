import { eq, desc, and, gte, lte, ne } from 'drizzle-orm';
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { InsertUser, users, orders, InsertOrder, orderStatusHistory, InsertOrderStatusHistory, notifications, InsertNotification, storeSettings, InsertStoreSettings, menuItems, InsertMenuItem, customIngredients, InsertCustomIngredient, promotions, InsertPromotion, adminUsers, InsertAdminUser, whatsappSettings, InsertWhatsappSettings, whatsappMessagesLog, InsertWhatsappMessagesLog, deliveryDrivers, InsertDeliveryDriver, coupons, InsertCoupon } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    try {
      const client = createClient({ 
        url: process.env.DATABASE_URL || "file:./local.db",
        authToken: process.env.DATABASE_AUTH_TOKEN,
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Order management helpers
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(order);
  // Return the ID of the inserted order
  return {
    id: (result as any).insertId || 0,
    ...result
  };
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByCustomerPhone(customerPhone: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orders).where(eq(orders.customerPhone, customerPhone)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

export async function updateOrderDriver(orderId: number, driverId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(orders).set({ driverId: driverId }).where(eq(orders.id, orderId));
}

export async function updateOrderLocation(orderId: number, driverLatitude: number | null, driverLongitude: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(orders).set({ driverLatitude, driverLongitude }).where(eq(orders.id, orderId));
}

export async function addOrderStatusHistory(history: InsertOrderStatusHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(orderStatusHistory).values(history);
}

export async function getOrderStatusHistory(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId)).orderBy(desc(orderStatusHistory.timestamp));
}

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(notifications).values(notification);
}

export async function updateNotificationStatus(notificationId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(notifications).set({ status: status as any }).where(eq(notifications.id, notificationId));
}

export async function getRecentOrders(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

export async function createAdmin(email: string, password: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const crypto = await import('crypto');
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  try {
    await db.insert(users).values({
      openId: `admin-${Date.now()}`,
      email,
      name,
      role: 'admin',
      loginMethod: 'local',
      lastSignedIn: new Date(),
    });
    return { success: true, message: 'Admin criado com sucesso' };
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    throw error;
  }
}

// ============================================
// STORE SETTINGS HELPERS
// ============================================

export async function getStoreSettings() {
  const db = await getDb();
  if (!db) return null;
  
  const settings = await db.select().from(storeSettings).limit(1);
  return settings[0] || null;
}

export async function updateStoreSettings(data: Partial<InsertStoreSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getStoreSettings();
  
  if (existing) {
    return db.update(storeSettings).set(data).where(eq(storeSettings.id, existing.id));
  } else {
    return db.insert(storeSettings).values(data as any);
  }
}

// ============================================
// MENU ITEMS HELPERS
// ============================================

export async function getMenuItems(category?: string, includeUnavailable: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(menuItems.isActive, 1)];
  
  if (!includeUnavailable) {
    conditions.push(eq(menuItems.isAvailable, 1));
  }
  
  if (category) {
    conditions.push(eq(menuItems.category, category as any));
  }
  
  const query = db.select().from(menuItems).where(and(...conditions));
  
  return query.orderBy(menuItems.displayOrder, menuItems.name);
}

export async function getMenuItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const items = await db.select().from(menuItems).where(eq(menuItems.id, id));
  return items[0] || null;
}

export async function createMenuItem(data: InsertMenuItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(menuItems).values(data);
}

export async function updateMenuItem(id: number, data: Partial<InsertMenuItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(menuItems).set(data).where(eq(menuItems.id, id));
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(menuItems).set({ isActive: 0 }).where(eq(menuItems.id, id));
}

// CUSTOM INGREDIENTS HELPERS

export async function getCustomIngredients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customIngredients)
    .where(eq(customIngredients.isActive, 1))
    .orderBy(customIngredients.displayOrder, customIngredients.name);
}

export async function getAllCustomIngredients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customIngredients)
    .orderBy(customIngredients.displayOrder, customIngredients.name);
}

export async function createCustomIngredient(data: InsertCustomIngredient) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(customIngredients).values(data);
}

export async function updateCustomIngredient(id: string, data: Partial<InsertCustomIngredient>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(customIngredients).set(data).where(eq(customIngredients.id, id));
}

export async function deleteCustomIngredient(id: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(customIngredients).set({ isActive: 0 }).where(eq(customIngredients.id, id));
}

export async function toggleCustomIngredientAvailability(id: string, isActive: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(customIngredients).set({ isActive }).where(eq(customIngredients.id, id));
}

// ============================================
// PROMOTIONS HELPERS
// ============================================

export async function getPromotions(onlyActive: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  
  let query: any = db.select().from(promotions);
  
  if (onlyActive) {
    query = db.select().from(promotions).where(eq(promotions.isActive, 1));
  }
  
  return query.orderBy(promotions.displayOrder, promotions.title);
}

export async function getPromotionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const promos = await db.select().from(promotions).where(eq(promotions.id, id));
  return promos[0] || null;
}

export async function createPromotion(data: InsertPromotion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(promotions).values(data);
}

export async function updatePromotion(id: number, data: Partial<InsertPromotion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(promotions).set(data).where(eq(promotions.id, id));
}

export async function deletePromotion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(promotions).set({ isActive: 0 }).where(eq(promotions.id, id));
}

// ============================================
// ADMIN USERS HELPERS
// ============================================

export async function getAdminByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const admins = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  return admins[0] || null;
}

export async function createAdminUser(email: string, passwordHash: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(adminUsers).values({
    email,
    passwordHash,
    name,
    role: 'owner',
    isActive: 1,
  });
}

export async function updateAdminLastLogin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, id));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrdersByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orders)
    .where(
      and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate),
        ne(orders.status, 'cancelled')
      )
    )
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersForDashboard() {
  const db = await getDb();
  if (!db) return [];
  
  // Get orders from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return db.select().from(orders)
    .where(gte(orders.createdAt, sevenDaysAgo))
    .orderBy(desc(orders.createdAt));
}


// ============================================
// WHATSAPP SETTINGS HELPERS
// ============================================

export async function getWhatsappSettings(adminUserId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const settings = await db.select().from(whatsappSettings).where(eq(whatsappSettings.adminUserId, adminUserId));
  return settings[0] || null;
}

export async function createWhatsappSettings(data: InsertWhatsappSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(whatsappSettings).values(data);
}

export async function updateWhatsappSettings(adminUserId: number, data: Partial<InsertWhatsappSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(whatsappSettings).set(data).where(eq(whatsappSettings.adminUserId, adminUserId));
}

// ============================================
// WHATSAPP MESSAGES LOG HELPERS
// ============================================

export async function logWhatsappMessage(data: InsertWhatsappMessagesLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(whatsappMessagesLog).values(data);
}

export async function getWhatsappMessagesByAdmin(adminUserId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(whatsappMessagesLog)
    .where(eq(whatsappMessagesLog.adminUserId, adminUserId))
    .orderBy(desc(whatsappMessagesLog.createdAt))
    .limit(limit);
}

export async function updateWhatsappMessageStatus(id: number, status: 'pending' | 'sent' | 'failed', errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { 
    status,
    sentAt: status === 'sent' ? new Date() : undefined
  };
  
  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }
  
  return db.update(whatsappMessagesLog).set(updateData).where(eq(whatsappMessagesLog.id, id));
}
export async function getDrivers() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.select().from(deliveryDrivers);
}
export async function createDriver(data: InsertDeliveryDriver) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(deliveryDrivers).values(data);
}
export async function updateDriver(id: number, data: Partial<InsertDeliveryDriver>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(deliveryDrivers).set(data).where(eq(deliveryDrivers.id, id));
}
export async function deleteDriver(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(deliveryDrivers).set({ isActive: 0 }).where(eq(deliveryDrivers.id, id));
}

export async function getCoupons() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.select().from(coupons).where(eq(coupons.isActive, 1));
}
export async function createCoupon(data: InsertCoupon) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(coupons).values({ ...data, isActive: 1 }).returning();
}
export async function updateCoupon(id: number, data: Partial<InsertCoupon>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(coupons).set(data).where(eq(coupons.id, id));
}
export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(coupons).set({ isActive: 0 }).where(eq(coupons.id, id));
}

