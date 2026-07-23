import { getDb } from './server/db';
import { orders } from './drizzle/schema';
import { gte } from 'drizzle-orm';

async function test() {
  const db = await getDb();
  if (db) {
    const q = db.select().from(orders).where(gte(orders.createdAt, new Date())).toSQL();
    console.log(q);
  }
}
test();
