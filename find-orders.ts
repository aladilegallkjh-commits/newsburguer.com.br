import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    const ordersResult = await client.execute("SELECT id, orderNumber, customerName, customerPhone FROM orders");
    console.log("All orders again:");
    console.table(ordersResult.rows);
  } catch (e: any) {
    console.error("Error finding orders:", e.message);
  }
}

main().catch(console.error);
