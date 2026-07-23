import { getDb } from './server/db';
import { orders } from './drizzle/schema';
import { desc } from 'drizzle-orm';

async function test() {
  const db = await getDb();
  if (db) {
    const res = await db.select().from(orders).orderBy(desc(orders.id)).limit(2);
    console.log(res.map(o => ({ id: o.id, created: o.createdAt })));
  }
}
test();
