import { createClient } from "@libsql/client";
import { config } from "dotenv";

config();

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN as string,
  });

  try {
    // 1. Delete specific order
    const orderNumber = 'ORD-2026-07-17-3069';
    console.log(`Checking order ${orderNumber}...`);
    const orderResult = await client.execute({
      sql: "SELECT id, customerName, totalAmount FROM orders WHERE orderNumber = ?",
      args: [orderNumber]
    });
    
    if (orderResult.rows.length > 0) {
      console.log("Found order:", orderResult.rows[0]);
      await client.execute({
        sql: "DELETE FROM orders WHERE orderNumber = ?",
        args: [orderNumber]
      });
      console.log(`Deleted order ${orderNumber}`);
    } else {
      console.log(`Order ${orderNumber} not found.`);
    }

    // 2. Find customers Joao and Leonardo
    const customersResult = await client.execute(
      "SELECT id, name FROM customers WHERE name LIKE '%joao%' OR name LIKE '%joão%' OR name LIKE '%leo%'"
    );
    
    if (customersResult.rows.length > 0) {
      console.log("Found customers to delete:");
      console.table(customersResult.rows);
      
      for (const row of customersResult.rows) {
        // Delete their rankings
        await client.execute({
          sql: "DELETE FROM customerRankings WHERE customerId = ?",
          args: [row.id]
        });
        
        // Delete the customer
        await client.execute({
          sql: "DELETE FROM customers WHERE id = ?",
          args: [row.id]
        });
        
        console.log(`Deleted customer ${row.name} (ID: ${row.id}) and their rankings.`);
      }
    } else {
      console.log("No Joao or Leo customers found.");
    }
    
  } catch (e: any) {
    console.error("Error connecting to Turso DB:", e.message);
  }
}

main().catch(console.error);
