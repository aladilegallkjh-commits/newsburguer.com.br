import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({ 
  url: process.env.DATABASE_URL || "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  const phone = "41999349874";
  const amount = 32.90;
  
  console.log("Deleting order...");
  await client.execute({
    sql: "DELETE FROM orders WHERE id = 65 OR orderNumber = 'ORD-2026-07-18-3389'",
    args: []
  });
  
  console.log("Updating ranking...");
  await client.execute({
    sql: "UPDATE customerRankings SET totalSpent = totalSpent - ?, totalOrders = totalOrders - 1 WHERE phone = ?",
    args: [amount, phone]
  });
  
  console.log("Done!");
}
main();
