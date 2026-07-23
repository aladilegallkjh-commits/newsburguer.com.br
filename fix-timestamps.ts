import { getDb } from './server/db';
import { orders } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function fix() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }
  
  const allOrders = await db.select().from(orders);
  let fixedCount = 0;
  
  for (const o of allOrders) {
    if (o.createdAt.getTime() < 10000000000) { 
      // It's in seconds instead of ms (i.e. year 1970)
      const newDate = new Date(o.createdAt.getTime() * 1000);
      await db.update(orders).set({ createdAt: newDate }).where(eq(orders.id, o.id));
      fixedCount++;
    }
  }
  
  console.log(`Fixed timestamps for ${fixedCount} orders.`);
}

fix().catch(console.error);
