import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    const result = await client.execute("SELECT id, orderNumber, customerName, customerPhone FROM orders WHERE orderNumber = 'ORD-2026-07-17-3069'");
    console.log("Finding exact order ORD-2026-07-17-3069:");
    console.table(result.rows);
    
    // Tentando deletar por ID ou nome
    const resultJoao = await client.execute("SELECT id, orderNumber, customerName FROM orders WHERE customerName = 'joao'");
    console.log("Finding all joao orders:");
    console.table(resultJoao.rows);

    for (const row of resultJoao.rows) {
       await client.execute({
          sql: "DELETE FROM orders WHERE id = ?",
          args: [row.id]
       });
       console.log(`Deleted order ${row.orderNumber}`);
    }
  } catch (e: any) {
    console.error("Error finding orders:", e.message);
  }
}

main().catch(console.error);
