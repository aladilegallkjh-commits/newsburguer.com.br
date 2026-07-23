import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({ 
  url: process.env.DATABASE_URL || "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log("Adding columns to storeSettings...");
  try { await client.execute("ALTER TABLE storeSettings ADD COLUMN freeDeliveryDistance REAL"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE storeSettings ADD COLUMN baseDeliveryFee REAL"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE storeSettings ADD COLUMN deliveryFeePerKm REAL"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE storeSettings ADD COLUMN maxDeliveryDistance REAL"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE storeSettings ADD COLUMN storeLatitude TEXT"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE storeSettings ADD COLUMN storeLongitude TEXT"); } catch(e) { console.log(e.message) }

  console.log("Adding columns to orders...");
  try { await client.execute("ALTER TABLE orders ADD COLUMN deliveryFee REAL"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE orders ADD COLUMN deliveryType TEXT DEFAULT 'delivery'"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE orders ADD COLUMN address TEXT"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE orders ADD COLUMN estimatedDeliveryTime INTEGER"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE orders ADD COLUMN couponId INTEGER"); } catch(e) { console.log(e.message) }
  try { await client.execute("ALTER TABLE orders ADD COLUMN driverId INTEGER"); } catch(e) { console.log(e.message) }
  
  console.log("Fixing timestamps...");
  const res = await client.execute("SELECT id, createdAt FROM orders");
  for (const row of res.rows) {
    let createdAt = row.createdAt;
    if (typeof createdAt === 'number' && createdAt < 10000000000) {
      await client.execute({
        sql: "UPDATE orders SET createdAt = ?, updatedAt = ? WHERE id = ?",
        args: [createdAt * 1000, createdAt * 1000, row.id]
      });
      console.log(`Updated order ${row.id}`);
    }
  }

  console.log("Done!");
}
main();
