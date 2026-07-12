import { createClient } from '@libsql/client';
import path from 'path';

const db = createClient({ url: `file:./local.db` });

async function run() {
  // Add missing column if needed
  try {
    await db.execute(`ALTER TABLE orders ADD COLUMN couponId INTEGER`);
    console.log("Added couponId column");
  } catch (e) {
    // Column likely already exists
  }

  // Get all customers with name = 'Cliente'
  const result = await db.execute(`SELECT id, phone, name FROM customers WHERE name = 'Cliente'`);
  console.log(`Found ${result.rows.length} customers with generic name`);

  for (const customer of result.rows) {
    const ordersResult = await db.execute({
      sql: `SELECT customerName FROM orders WHERE customerPhone = ? ORDER BY createdAt DESC LIMIT 1`,
      args: [customer.phone as string],
    });

    if (ordersResult.rows.length > 0 && ordersResult.rows[0].customerName) {
      await db.execute({
        sql: `UPDATE customers SET name = ? WHERE id = ?`,
        args: [ordersResult.rows[0].customerName, customer.id as number],
      });
      console.log(`Fixed: ${customer.phone} → ${ordersResult.rows[0].customerName}`);
    }
  }

  console.log("Done!");
}

run().catch(console.error);

