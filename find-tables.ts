import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    const db = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tables in database:");
    console.table(db.rows);
  } catch (e: any) {
    console.error("Error finding tables:", e.message);
  }
}

main().catch(console.error);
