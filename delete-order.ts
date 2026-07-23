import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    const ordersResult = await client.execute("SELECT id, orderNumber, customerName FROM orders WHERE orderNumber = 'ORD-2026-07-17-3069'");
    console.log("Order found:");
    console.table(ordersResult.rows);

    if (ordersResult.rows.length > 0) {
      await client.execute({
        sql: "DELETE FROM orders WHERE orderNumber = ?",
        args: ['ORD-2026-07-17-3069']
      });
      console.log("Order deleted.");
    }
  } catch (e: any) {
    console.error("Error finding orders:", e.message);
  }
}

main().catch(console.error);
