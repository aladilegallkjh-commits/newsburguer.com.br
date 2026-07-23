import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    await client.execute('ALTER TABLE "orders" ADD COLUMN "deliveryFee" REAL DEFAULT 0');
    console.log("Added deliveryFee to orders");
  } catch (e: any) {
    console.error("Error adding deliveryFee to orders", e.message);
  }

  try {
    await client.execute('ALTER TABLE "storeSettings" ADD COLUMN "freeDeliveryDistance" REAL DEFAULT 6');
    await client.execute('ALTER TABLE "storeSettings" ADD COLUMN "baseDeliveryFee" REAL DEFAULT 0');
    await client.execute('ALTER TABLE "storeSettings" ADD COLUMN "deliveryFeePerKm" REAL DEFAULT 0');
    await client.execute('ALTER TABLE "storeSettings" ADD COLUMN "maxDeliveryDistance" REAL DEFAULT 10');
    await client.execute('ALTER TABLE "storeSettings" ADD COLUMN "storeLatitude" REAL');
    await client.execute('ALTER TABLE "storeSettings" ADD COLUMN "storeLongitude" REAL');
    console.log("Added delivery fields to storeSettings");
  } catch (e: any) {
    console.error("Error adding fields to storeSettings", e.message);
  }
}

main().catch(console.error);
