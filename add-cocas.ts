import { getDb } from './server/db';
import { menuItems } from './drizzle/schema';
import dotenv from 'dotenv';
dotenv.config();

async function addCocas() {
  const db = await getDb();
  if (!db) {
    console.error('No database connection');
    return;
  }

  const newDrinks = [
    {
      name: "Coca-Cola 600ml",
      description: "Refrigerante Coca-Cola 600ml (Original)",
      category: "drinks" as const,
      price: 8.00, // Preço inicial, pode ser alterado no painel
      imageUrl: "",
      ingredients: [],
      extras: [],
      isActive: 1,
      displayOrder: 10,
    },
    {
      name: "Coca-Cola Zero 600ml",
      description: "Refrigerante Coca-Cola Sem Açúcar 600ml",
      category: "drinks" as const,
      price: 8.00,
      imageUrl: "",
      ingredients: [],
      extras: [],
      isActive: 1,
      displayOrder: 11,
    }
  ];

  for (const drink of newDrinks) {
    try {
      await db.insert(menuItems).values(drink);
      console.log(`✅ Adicionado: ${drink.name}`);
    } catch (e: any) {
      console.error(`❌ Erro ao adicionar ${drink.name}:`, e.message);
    }
  }

  console.log("Feito!");
}

addCocas().catch(console.error);
