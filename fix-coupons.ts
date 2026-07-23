import 'dotenv/config';
import { getDb } from './server/db.ts';
import { coupons } from './drizzle/schema.ts';
import { isNull } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) return;
  const result = await db.update(coupons).set({ isActive: 1 }).where(isNull(coupons.isActive));
  console.log("Updated coupons:", result);
}
main().catch(console.error);
