import 'dotenv/config';
import { getDb } from './server/db.ts';
import { coupons } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) return;
  const allCoupons = await db.select().from(coupons);
  console.log("All coupons from Turso:", allCoupons);
}
main().catch(console.error);
