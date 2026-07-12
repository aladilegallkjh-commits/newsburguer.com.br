import { getDb } from './server/db';
import { orders, customers, customerRankings } from './drizzle/schema';
import { desc } from 'drizzle-orm';

async function inspect() {
  const db = await getDb();
  if (!db) { console.error('DB not available'); return; }

  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(20);
  console.log(`\n=== ORDERS (${allOrders.length}) ===`);
  for (const o of allOrders) {
    console.log(`  #${o.id} | ${o.customerName} | ${o.customerPhone} | R$${o.finalAmount} | ${o.status}`);
  }

  const allCustomers = await db.select().from(customers);
  console.log(`\n=== CUSTOMERS (${allCustomers.length}) ===`);
  for (const c of allCustomers) {
    console.log(`  #${c.id} | ${c.name} | ${c.phone} | orders=${c.totalOrders}`);
  }

  const rankings = await db.select().from(customerRankings);
  console.log(`\n=== RANKINGS (${rankings.length}) ===`);
  for (const r of rankings) {
    console.log(`  #${r.id} | customerId=${r.customerId} | period=${r.period} | pos=${r.position} | orders=${r.orderCount}`);
  }
}

inspect().catch(console.error);
