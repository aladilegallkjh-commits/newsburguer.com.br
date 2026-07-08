import { getDb } from './db';
import { orders, customers } from '../drizzle/schema';
import { eq, gte, lte, sql } from 'drizzle-orm';

export interface AnalyticsMetrics {
  totalOrders: number;
  totalRevenue: string;
  averageTicket: string;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueToday: string;
  revenueThisWeek: string;
  revenueThisMonth: string;
  topCustomers: Array<{
    name: string;
    phone: string;
    orderCount: number;
    totalSpent: string;
  }>;
  ordersByHour: Array<{
    hour: number;
    count: number;
  }>;
  ordersByDay: Array<{
    day: string;
    count: number;
    revenue: string;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  averageDeliveryTime: number; // in minutes
}

export async function getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total metrics
  const totalMetrics = await db
    .select({
      count: sql<number>`COUNT(${orders.id})`,
      revenue: sql<string>`SUM(${orders.finalAmount})`,
    })
    .from(orders)
    .where(eq(orders.status, 'delivered'));

  const totalOrders = totalMetrics[0]?.count || 0;
  const totalRevenue = (totalMetrics[0]?.revenue || '0').toString();
  const averageTicket = totalOrders > 0 
    ? (parseFloat(totalRevenue) / totalOrders).toFixed(2)
    : '0.00';

  // Today metrics
  const todayMetrics = await db
    .select({
      count: sql<number>`COUNT(${orders.id})`,
      revenue: sql<string>`SUM(${orders.finalAmount})`,
    })
    .from(orders)
    .where(
      sql`${orders.status} = 'delivered' AND DATE(${orders.createdAt}) = DATE(${todayStart})`
    );

  const ordersToday = todayMetrics[0]?.count || 0;
  const revenueToday = (todayMetrics[0]?.revenue || '0').toString();

  // This week metrics
  const weekMetrics = await db
    .select({
      count: sql<number>`COUNT(${orders.id})`,
      revenue: sql<string>`SUM(${orders.finalAmount})`,
    })
    .from(orders)
    .where(
      sql`${orders.status} = 'delivered' AND ${orders.createdAt} >= ${weekStart}`
    );

  const ordersThisWeek = weekMetrics[0]?.count || 0;
  const revenueThisWeek = (weekMetrics[0]?.revenue || '0').toString();

  // This month metrics
  const monthMetrics = await db
    .select({
      count: sql<number>`COUNT(${orders.id})`,
      revenue: sql<string>`SUM(${orders.finalAmount})`,
    })
    .from(orders)
    .where(
      sql`${orders.status} = 'delivered' AND ${orders.createdAt} >= ${monthStart}`
    );

  const ordersThisMonth = monthMetrics[0]?.count || 0;
  const revenueThisMonth = (monthMetrics[0]?.revenue || '0').toString();

  // Top customers
  const topCustomers = await db
    .select({
      name: customers.name,
      phone: customers.phone,
      orderCount: sql<number>`COUNT(${orders.id})`,
      totalSpent: sql<string>`SUM(${orders.finalAmount})`,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerPhone, customers.phone))
    .where(eq(orders.status, 'delivered'))
    .groupBy(customers.id)
    .orderBy(sql`COUNT(${orders.id}) DESC`)
    .limit(5);

  // Orders by hour
  const ordersByHour = await db
    .select({
      hour: sql<number>`HOUR(${orders.createdAt})`,
      count: sql<number>`COUNT(${orders.id})`,
    })
    .from(orders)
    .where(
      sql`${orders.status} = 'delivered' AND DATE(${orders.createdAt}) >= DATE_SUB(${now}, INTERVAL 7 DAY)`
    )
    .groupBy(sql`HOUR(${orders.createdAt})`)
    .orderBy(sql`HOUR(${orders.createdAt})`);

  // Orders by day (last 30 days)
  const ordersByDay = await db
    .select({
      day: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`,
      count: sql<number>`COUNT(${orders.id})`,
      revenue: sql<string>`SUM(${orders.finalAmount})`,
    })
    .from(orders)
    .where(
      sql`${orders.status} = 'delivered' AND ${orders.createdAt} >= DATE_SUB(${now}, INTERVAL 30 DAY)`
    )
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  // Orders by status
  const ordersByStatus = await db
    .select({
      status: orders.status,
      count: sql<number>`COUNT(${orders.id})`,
    })
    .from(orders)
    .groupBy(orders.status);

  // Average delivery time (from createdAt to estimatedDeliveryTime)
  const deliveryTimeData = await db
    .select({
      avgMinutes: sql<number>`AVG(TIMESTAMPDIFF(MINUTE, ${orders.createdAt}, ${orders.estimatedDeliveryTime}))`,
    })
    .from(orders)
    .where(eq(orders.status, 'delivered'));

  const averageDeliveryTime = Math.round(deliveryTimeData[0]?.avgMinutes || 45);

  return {
    totalOrders,
    totalRevenue,
    averageTicket,
    ordersToday,
    ordersThisWeek,
    ordersThisMonth,
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    topCustomers: topCustomers.map(c => ({
      name: c.name || 'Unknown',
      phone: c.phone,
      orderCount: c.orderCount || 0,
      totalSpent: (c.totalSpent || '0').toString(),
    })),
    ordersByHour: ordersByHour.map(h => ({
      hour: h.hour || 0,
      count: h.count || 0,
    })),
    ordersByDay: ordersByDay.map(d => ({
      day: d.day || '',
      count: d.count || 0,
      revenue: (d.revenue || '0').toString(),
    })),
    ordersByStatus: ordersByStatus.map(s => ({
      status: s.status || 'unknown',
      count: s.count || 0,
    })),
    averageDeliveryTime,
  };
}
