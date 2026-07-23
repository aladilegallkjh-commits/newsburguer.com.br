import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    const result = await client.execute("SELECT id, name, phone FROM customers");
    console.log("All customers:");
    console.table(result.rows);
  } catch (e: any) {
    console.error("Error finding customers:", e.message);
  }
}

main().catch(console.error);
