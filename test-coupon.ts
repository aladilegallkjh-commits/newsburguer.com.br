import { createCoupon, getCoupons } from './server/db';
import { coupons } from './drizzle/schema';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

async function run() {
  try {
    const data = {
      code: "TESTCODE",
      discountType: "percentage" as any,
      discountValue: 10,
      minOrderAmount: 0
    };
    console.log("Attempting to insert:", data);
    const res = await createCoupon(data as any);
    console.log("Success:", res);
    
    const all = await getCoupons();
    console.log("All coupons:", all);
  } catch (e) {
    console.error("Error creating coupon:", e);
  }
}
run();
