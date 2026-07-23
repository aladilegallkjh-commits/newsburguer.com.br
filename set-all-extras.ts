import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({ 
  url: process.env.DATABASE_URL || "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  // Buscar todos os ingredientes ativos do banco
  const ingRes = await client.execute(
    "SELECT id, name, price, category FROM customIngredients WHERE isActive = 1 ORDER BY category, name"
  );

  // Ordem de exibição das categorias
  const categoryOrder: Record<string, number> = {
    carnes: 0,
    queijos: 1,
    molhos: 2,
    vegetais: 3,
    extras: 4,
    paes: 5,
  };

  const allExtras = ingRes.rows
    .sort((a, b) => {
      const catA = categoryOrder[a.category as string] ?? 99;
      const catB = categoryOrder[b.category as string] ?? 99;
      return catA - catB || (a.name as string).localeCompare(b.name as string);
    })
    .map((ing) => ({
      id: ing.id as string,
      name: ing.name as string,
      price: ing.price as number,
    }));

  const extrasJson = JSON.stringify(allExtras);
  console.log(`Updating all menu items with ${allExtras.length} extras...`);

  // Buscar todos os itens do menu
  const itemsRes = await client.execute("SELECT id, name FROM menuItems WHERE isActive = 1");
  
  for (const item of itemsRes.rows) {
    await client.execute({
      sql: "UPDATE menuItems SET extras = ? WHERE id = ?",
      args: [extrasJson, item.id as number],
    });
    console.log(`  ✓ ${item.name}`);
  }

  console.log("\nDone! All menu items now have all ingredients as extras.");
}
main();
