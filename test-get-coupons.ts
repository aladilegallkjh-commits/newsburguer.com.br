import 'dotenv/config';
import { getCoupons } from './server/db.ts';

async function main() {
  const coupons = await getCoupons();
  console.log("getCoupons returns:", coupons);
}
main().catch(console.error);
