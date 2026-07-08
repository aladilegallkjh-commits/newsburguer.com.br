import { getDb } from './db';
import { customers, customerRankings, prizeCodes, orders } from '../drizzle/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Get or create customer
 */
export async function upsertCustomer(phone: string, name: string, email?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(customers).values({
    phone,
    name,
    email: email || null,
    totalOrders: 0,
    totalSpent: '0' as any,
  });

  return { id: 0, phone, name, email: email || null, totalOrders: 0, totalSpent: '0' as any, createdAt: new Date(), updatedAt: new Date() };
}

/**
 * Update customer order count and total spent
 */
export async function updateCustomerStats(phone: string, orderAmount: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const customer = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  
  if (customer.length > 0) {
    const newTotal = (customer[0].totalOrders || 0) + 1;
    const newSpent = (parseFloat(customer[0].totalSpent?.toString() || '0') + orderAmount).toFixed(2);
    
    await db.update(customers)
      .set({
        totalOrders: newTotal,
        totalSpent: newSpent as any,
      })
      .where(eq(customers.phone, phone));
  } else {
    // Create new customer if doesn't exist
    await db.insert(customers).values({
      phone,
      name: 'Cliente',
      email: null,
      totalOrders: 1,
      totalSpent: orderAmount.toString() as any,
    });
  }
}

/**
 * Calculate weekly rankings
 */
export async function calculateWeeklyRankings() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Get top customers this week
  const topCustomers = await db
    .select({
      customerId: customers.id,
      phone: customers.phone,
      name: customers.name,
      orderCount: sql<number>`COUNT(${orders.id})`,
      totalSpent: sql<string>`SUM(${orders.finalAmount})`,
    })
    .from(customers)
    .leftJoin(orders, and(
      eq(orders.customerPhone, customers.phone),
      gte(orders.createdAt, weekStart),
      lte(orders.createdAt, weekEnd),
      sql`${orders.status} != 'cancelled'`
    ))
    .groupBy(customers.id)
    .orderBy(desc(sql<number>`COUNT(${orders.id})`))
    .limit(5);

  // Clear old rankings for this week
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-week-${Math.ceil(now.getDate() / 7)}`;
  
  // Delete old rankings for this period
  await db.delete(customerRankings)
    .where(eq(customerRankings.period, 'week'));
  
  // Insert new rankings
  for (let i = 0; i < topCustomers.length; i++) {
    const customer = topCustomers[i];
    if (!customer.customerId) continue;

    const prizeType = i === 0 ? 'hamburger_kids' : 'none';
    
    await db.insert(customerRankings).values({
      customerId: customer.customerId,
      period: 'week',
      position: i + 1,
      orderCount: customer.orderCount || 0,
      totalSpent: customer.totalSpent as any,
      prizeWon: prizeType as any,
    });

    // Generate prize code if won
    if (prizeType !== 'none' && customer.customerId) {
      const prizeCode = `WEEK-${nanoid(8).toUpperCase()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.insert(prizeCodes).values({
        code: prizeCode,
        prizeType: prizeType as any,
        customerId: customer.customerId,
        customerPhone: customer.phone,
        period,
        isUsed: 0,
        expiresAt,
      });
    }
  }
}

/**
 * Calculate monthly rankings
 */
export async function calculateMonthlyRankings() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get top customers this month
  const topCustomers = await db
    .select({
      customerId: customers.id,
      phone: customers.phone,
      name: customers.name,
      orderCount: sql<number>`COUNT(${orders.id})`,
      totalSpent: sql<string>`SUM(${orders.finalAmount})`,
    })
    .from(customers)
    .leftJoin(orders, and(
      eq(orders.customerPhone, customers.phone),
      gte(orders.createdAt, monthStart),
      lte(orders.createdAt, monthEnd),
      sql`${orders.status} != 'cancelled'`
    ))
    .groupBy(customers.id)
    .orderBy(desc(sql<number>`COUNT(${orders.id})`))
    .limit(5);

  // Clear old rankings for this month
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-month`;

  // Delete old rankings for this period
  await db.delete(customerRankings)
    .where(eq(customerRankings.period, 'month'));

  // Insert new rankings
  for (let i = 0; i < topCustomers.length; i++) {
    const customer = topCustomers[i];
    if (!customer.customerId) continue;

    const prizeType = i === 0 ? 'combo_free' : 'none';
    
    await db.insert(customerRankings).values({
      customerId: customer.customerId,
      period: 'month',
      position: i + 1,
      orderCount: customer.orderCount || 0,
      totalSpent: customer.totalSpent as any,
      prizeWon: prizeType as any,
    });

    // Generate prize code if won
    if (prizeType !== 'none' && customer.customerId) {
      const prizeCode = `MONTH-${nanoid(8).toUpperCase()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.insert(prizeCodes).values({
        code: prizeCode,
        prizeType: prizeType as any,
        customerId: customer.customerId,
        customerPhone: customer.phone,
        period,
        isUsed: 0,
        expiresAt,
      });
    }
  }
}

/**
 * Get current rankings (weekly and monthly)
 */
export async function getCurrentRankings() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const weeklyRankings = await db
    .select({
      position: customerRankings.position,
      customerId: customerRankings.customerId,
      customerName: customers.name,
      orderCount: customerRankings.orderCount,
      totalSpent: customerRankings.totalSpent,
      prizeWon: customerRankings.prizeWon,
    })
    .from(customerRankings)
    .leftJoin(customers, eq(customerRankings.customerId, customers.id))
    .where(eq(customerRankings.period, 'week'))
    .orderBy(customerRankings.position);

  const monthlyRankings = await db
    .select({
      position: customerRankings.position,
      customerId: customerRankings.customerId,
      customerName: customers.name,
      orderCount: customerRankings.orderCount,
      totalSpent: customerRankings.totalSpent,
      prizeWon: customerRankings.prizeWon,
    })
    .from(customerRankings)
    .leftJoin(customers, eq(customerRankings.customerId, customers.id))
    .where(eq(customerRankings.period, 'month'))
    .orderBy(customerRankings.position);

  // Get all-time rankings from customers table
  const allTimeRankings = await db
    .select({
      position: sql<number>`ROW_NUMBER() OVER (ORDER BY ${customers.totalOrders} DESC)`,
      customerId: customers.id,
      customerName: customers.name,
      orderCount: customers.totalOrders,
      totalSpent: customers.totalSpent,
      prizeWon: sql<string>`'none'`,
    })
    .from(customers)
    .orderBy(desc(customers.totalOrders))
    .limit(5);

  return { weeklyRankings, monthlyRankings, allTimeRankings };
}

/**
 * Get customer prize codes
 */
export async function getCustomerPrizeCodes(phone: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db.select().from(prizeCodes)
    .where(and(
      eq(prizeCodes.customerPhone, phone),
      eq(prizeCodes.isUsed, 0)
    ));
}

/**
 * Use prize code
 */
export async function usePrizeCode(code: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const prizeCode = await db.select().from(prizeCodes)
    .where(eq(prizeCodes.code, code))
    .limit(1);

  if (prizeCode.length === 0) {
    throw new Error('Prize code not found');
  }

  if (prizeCode[0].isUsed) {
    throw new Error('Prize code already used');
  }

  if (new Date() > prizeCode[0].expiresAt) {
    throw new Error('Prize code expired');
  }

  await db.update(prizeCodes)
    .set({ isUsed: 1, usedAt: new Date() })
    .where(eq(prizeCodes.code, code));

  return prizeCode[0];
}
