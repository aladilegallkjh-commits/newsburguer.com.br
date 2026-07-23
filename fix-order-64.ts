import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({ 
  url: process.env.DATABASE_URL || "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log("Fixing order 64 timestamp (divide by 1000)...");
  await client.execute({
    sql: "UPDATE orders SET createdAt = createdAt / 1000, updatedAt = updatedAt / 1000 WHERE id = 64",
    args: []
  });
  console.log("Done!");
}
main();
