import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    const idsResult = await client.execute("SELECT id, name FROM customers WHERE name LIKE '%leo%' OR name LIKE '%joão%' OR name LIKE '%joao%'");
    
    if (idsResult.rows.length === 0) {
      console.log("Nenhum cliente encontrado com os nomes João ou Leo.");
      return;
    }

    const ids = idsResult.rows.map(r => r.id);
    console.log(`Removendo do ranking os clientes: ${idsResult.rows.map(r => r.name).join(", ")}`);

    for (const id of ids) {
      await client.execute({
        sql: "DELETE FROM customerRankings WHERE customerId = ?",
        args: [id]
      });
      await client.execute({
        sql: "DELETE FROM customers WHERE id = ?",
        args: [id]
      });
    }

    console.log("Deletados com sucesso.");
  } catch (e: any) {
    console.error("Erro ao deletar:", e.message);
  }
}

main().catch(console.error);
