import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    const result = await client.execute("SELECT * FROM customers WHERE name LIKE '%joão%' OR name LIKE '%joao%' OR name LIKE '%leo%' OR name LIKE '%léo%'");
    console.log("Found customers:");
    console.table(result.rows);
  } catch (e: any) {
    console.error("Error finding customers:", e.message);
  }
}

main().catch(console.error);
