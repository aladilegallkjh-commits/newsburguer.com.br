import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://newsburguer-newsburguer.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM1NDY3NDcsImlkIjoiMDE5ZjQzYWEtOTIwMS03Y2I0LWI2YWMtMzhkMDk3N2M5N2I3Iiwia2lkIjoiT0tZMFI1clVfX2JMZjV6RGgtS2tDVmdoVnZBVlVxeHYxeWFoTmNEa3pWdyIsInJpZCI6ImExMTcyZDcxLWUzNjctNGEyOS04Yzc4LTk1MmU0NGZmNDc5YiJ9.raLjvHAzv8Rk-dgJS6xB5tw4qsoZwCmPz0UR3IyYD4wazMCtzcb29eqloxC29bgCjTp2J9o87wdfD3WFEqoRAQ',
});

interface IngredientSeed {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string | null;
  price: number;
  category: string;
  categoryLabel: string;
  displayOrder: number;
}

const ingredients: IngredientSeed[] = [
  // Pães
  { id: 'ci-pao-brioche', name: 'Pão Brioche', emoji: '🍞', imageUrl: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=200&auto=format&fit=crop', price: 4.00, category: 'paes', categoryLabel: 'Pães', displayOrder: 0 },
  { id: 'ci-pao-hotdog', name: 'Pão Hot Dog Tradicional', emoji: '🌭', imageUrl: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=200&auto=format&fit=crop', price: 3.00, category: 'paes', categoryLabel: 'Pães', displayOrder: 1 },
  { id: 'ci-pao-hotdog-25cm', name: 'Pão Hot Dog 25cm (Prensado)', emoji: '🌭', imageUrl: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?q=80&w=200&auto=format&fit=crop', price: 5.00, category: 'paes', categoryLabel: 'Pães', displayOrder: 2 },

  // Carnes
  { id: 'ci-burger-180', name: 'Hambúrguer Artesanal 180g', emoji: '🥩', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop', price: 10.00, category: 'carnes', categoryLabel: 'Carnes', displayOrder: 3 },
  { id: 'ci-smash-90', name: 'Hambúrguer Smash 90g', emoji: '🥩', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop', price: 5.50, category: 'carnes', categoryLabel: 'Carnes', displayOrder: 4 },
  { id: 'ci-salsicha', name: 'Salsicha', emoji: '🌭', imageUrl: 'https://images.unsplash.com/photo-1534122119098-b80c5ce3d800?q=80&w=200&auto=format&fit=crop', price: 3.50, category: 'carnes', categoryLabel: 'Carnes', displayOrder: 5 },
  { id: 'ci-frango', name: 'Frango Desfiado Temperado', emoji: '🍗', imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=200&auto=format&fit=crop', price: 4.00, category: 'carnes', categoryLabel: 'Carnes', displayOrder: 6 },
  { id: 'ci-bacon', name: 'Bacon Crocante', emoji: '🥓', imageUrl: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?q=80&w=200&auto=format&fit=crop', price: 4.50, category: 'carnes', categoryLabel: 'Carnes', displayOrder: 7 },
  { id: 'ci-calabresa', name: 'Calabresa', emoji: '🌶️', imageUrl: 'https://images.unsplash.com/photo-1529177114674-cfaea0f5139a?q=80&w=200&auto=format&fit=crop', price: 3.50, category: 'carnes', categoryLabel: 'Carnes', displayOrder: 8 },
  { id: 'ci-ovo', name: 'Ovo Frito', emoji: '🍳', imageUrl: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?q=80&w=200&auto=format&fit=crop', price: 2.50, category: 'carnes', categoryLabel: 'Carnes', displayOrder: 9 },

  // Queijos
  { id: 'ci-cheddar', name: 'Queijo Cheddar', emoji: '🧀', imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=200&auto=format&fit=crop', price: 3.00, category: 'queijos', categoryLabel: 'Queijos & Cremes', displayOrder: 10 },
  { id: 'ci-cream-cheese', name: 'Cream Cheese', emoji: '🧀', imageUrl: 'https://images.unsplash.com/photo-1628178652431-89d8db18f3a8?q=80&w=200&auto=format&fit=crop', price: 2.50, category: 'queijos', categoryLabel: 'Queijos & Cremes', displayOrder: 11 },
  { id: 'ci-catupiry', name: 'Catupiry Original', emoji: '🧀', imageUrl: 'https://images.unsplash.com/photo-1628178652431-89d8db18f3a8?q=80&w=200&auto=format&fit=crop', price: 3.00, category: 'queijos', categoryLabel: 'Queijos & Cremes', displayOrder: 12 },

  // Molhos
  { id: 'ci-molho-barbecue', name: 'Molho Barbecue', emoji: '🫙', imageUrl: 'https://images.unsplash.com/photo-1585325701165-351af916e581?q=80&w=200&auto=format&fit=crop', price: 1.50, category: 'molhos', categoryLabel: 'Molhos', displayOrder: 13 },
  { id: 'ci-molho-especial', name: 'Molho Especial da Casa', emoji: '🫙', imageUrl: 'https://images.unsplash.com/photo-1622978135891-b9627715ecda?q=80&w=200&auto=format&fit=crop', price: 1.50, category: 'molhos', categoryLabel: 'Molhos', displayOrder: 14 },
  { id: 'ci-molho-picante', name: 'Molho Picante', emoji: '🌶️', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop', price: 1.50, category: 'molhos', categoryLabel: 'Molhos', displayOrder: 15 },
  { id: 'ci-molho-news', name: "Molho New's", emoji: '⭐', imageUrl: 'https://images.unsplash.com/photo-1622978135891-b9627715ecda?q=80&w=200&auto=format&fit=crop', price: 2.00, category: 'molhos', categoryLabel: 'Molhos', displayOrder: 16 },
  { id: 'ci-maionese', name: 'Maionese da Casa', emoji: '🫙', imageUrl: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=200&auto=format&fit=crop', price: 1.00, category: 'molhos', categoryLabel: 'Molhos', displayOrder: 17 },

  // Vegetais
  { id: 'ci-alface', name: 'Alface Americana', emoji: '🥬', imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=200&auto=format&fit=crop', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas', displayOrder: 18 },
  { id: 'ci-tomate', name: 'Tomate', emoji: '🍅', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=200&auto=format&fit=crop', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas', displayOrder: 19 },
  { id: 'ci-cebola', name: 'Cebola', emoji: '🧅', imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=200&auto=format&fit=crop', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas', displayOrder: 20 },
  { id: 'ci-picles', name: 'Picles', emoji: '🥒', imageUrl: 'https://images.unsplash.com/photo-1520696956693-455b57223e74?q=80&w=200&auto=format&fit=crop', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas', displayOrder: 21 },
  { id: 'ci-milho', name: 'Milho', emoji: '🌽', imageUrl: 'https://images.unsplash.com/photo-1533038662993-4d4361abcc0f?q=80&w=200&auto=format&fit=crop', price: 1.00, category: 'vegetais', categoryLabel: 'Vegetais & Saladas', displayOrder: 22 },

  // Extras
  { id: 'ci-onion-rings', name: 'Onion Rings', emoji: '🧅', imageUrl: 'https://images.unsplash.com/photo-1639024471210-203b573a6eeb?q=80&w=200&auto=format&fit=crop', price: 4.50, category: 'extras', categoryLabel: 'Extras & Crocantes', displayOrder: 23 },
  { id: 'ci-doritos', name: 'Doritos', emoji: '🌮', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop', price: 2.50, category: 'extras', categoryLabel: 'Extras & Crocantes', displayOrder: 24 },
  { id: 'ci-batata-palha', name: 'Batata Palha', emoji: '🍟', imageUrl: 'https://images.unsplash.com/photo-1541592102775-7b8ac428ce0c?q=80&w=200&auto=format&fit=crop', price: 1.50, category: 'extras', categoryLabel: 'Extras & Crocantes', displayOrder: 25 },
  { id: 'ci-oregano', name: 'Orégano', emoji: '🌿', imageUrl: 'https://images.unsplash.com/photo-1596647242171-ec59d04bc2ad?q=80&w=200&auto=format&fit=crop', price: 0.50, category: 'extras', categoryLabel: 'Extras & Crocantes', displayOrder: 26 },
];

async function run() {
  console.log('Creating customIngredients table if not exists...');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS customIngredients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      imageUrl TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      categoryLabel TEXT NOT NULL,
      isActive INTEGER DEFAULT 1 NOT NULL,
      displayOrder INTEGER DEFAULT 0 NOT NULL
    )
  `);

  console.log('Seeding custom ingredients...');
  for (const ing of ingredients) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO customIngredients (id, name, emoji, imageUrl, price, category, categoryLabel, isActive, displayOrder)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [ing.id, ing.name, ing.emoji, ing.imageUrl, ing.price, ing.category, ing.categoryLabel, ing.displayOrder],
    });
    console.log(`  ✓ ${ing.name}`);
  }

  console.log('\nDone! All ingredients seeded.');
}

run().catch(console.error);
