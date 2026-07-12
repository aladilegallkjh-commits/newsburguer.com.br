import { getDb } from './server/db';
import { customers, orders } from './drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

async function fixNames() {
  const db = await getDb();
  if (!db) { console.error('DB not available'); return; }

  // Get all customers
  const allCustomers = await db.select().from(customers);
  console.log(`Total customers: ${allCustomers.length}`);

  for (const customer of allCustomers) {
    console.log(`Customer: ${customer.id} | ${customer.phone} | name="${customer.name}"`);

    // Find latest order for this phone to get the real name
    const latestOrders = await db
      .select({ customerName: orders.customerName })
      .from(orders)
      .where(eq(orders.customerPhone, customer.phone))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    if (latestOrders.length > 0 && latestOrders[0].customerName) {
      const realName = latestOrders[0].customerName;
      if (realName !== customer.name) {
        console.log(`  → Updating to "${realName}"`);
        await db.update(customers)
          .set({ name: realName })
          .where(eq(customers.id, customer.id));
      } else {
        console.log(`  → Already correct: "${realName}"`);
      }
    }
  }

  console.log('Done!');
}

fixNames().catch(console.error);
