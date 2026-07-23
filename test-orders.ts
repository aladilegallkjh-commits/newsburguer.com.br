import { getDb } from './server/db';
import { orders } from './drizzle/schema';

async function test() {
  const db = await getDb();
  if(!db) return;
  const all = await db.select().from(orders);
  console.log(`Total orders: ${all.length}`);
  for (const o of all) {
    console.log(`Order ${o.id}: createdAt = ${o.createdAt.toISOString()}`);
  }
}
test();
