import 'dotenv/config';
import { getDb } from './server/db.ts';
import { coupons } from './drizzle/schema.ts';

async function main() {
  const db = await getDb();
  if (!db) return;
  const newCoupon = await db.insert(coupons).values({
    code: 'TESTNEW',
    discountType: 'percentage',
    discountValue: 20
  }).returning();
  console.log("Created coupon:", newCoupon);
}
main().catch(console.error);
