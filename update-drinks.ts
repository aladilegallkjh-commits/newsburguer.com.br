import { getDb } from './server/db';
import { menuItems } from './drizzle/schema';
import { eq, inArray } from 'drizzle-orm';

// Novas bebidas com precos sugeridos (boa margem de lucro + valor justo ao cliente)
const novasBebidas = [
  {
    name: 'Água Sem Gás 510ml',
    description: 'Água mineral sem gás gelada 510ml',
    category: 'drinks' as const,
    price: 4.50,
    imageUrl: '',
    ingredients: ['Água sem gás 510ml'],
    extras: [],
    isActive: 1,
    displayOrder: 1,
  },
  {
    name: 'Água Com Gás 510ml',
    description: 'Água mineral com gás gelada 510ml',
    category: 'drinks' as const,
    price: 5.00,
    imageUrl: '',
    ingredients: ['Água com gás 510ml'],
    extras: [],
    isActive: 1,
    displayOrder: 2,
  },
  {
    name: 'Coca-Cola 310ml',
    description: 'Coca-Cola gelada lata 310ml',
    category: 'drinks' as const,
    price: 5.50,
    imageUrl: '',
    ingredients: ['Coca-Cola 310ml'],
    extras: [],
    isActive: 1,
    displayOrder: 3,
  },
  {
    name: 'Coca-Cola 350ml',
    description: 'Coca-Cola gelada lata 350ml',
    category: 'drinks' as const,
    price: 6.00,
    imageUrl: '',
    ingredients: ['Coca-Cola 350ml'],
    extras: [],
    isActive: 1,
    displayOrder: 4,
  },
  {
    name: 'Coca-Cola 350ml Zero',
    description: 'Coca-Cola Zero gelada lata 350ml',
    category: 'drinks' as const,
    price: 6.00,
    imageUrl: '',
    ingredients: ['Coca-Cola 350ml Zero'],
    extras: [],
    isActive: 1,
    displayOrder: 5,
  },
  {
    name: 'Pepsi 350ml',
    description: 'Pepsi gelada lata 350ml',
    category: 'drinks' as const,
    price: 5.50,
    imageUrl: '',
    ingredients: ['Pepsi 350ml'],
    extras: [],
    isActive: 1,
    displayOrder: 6,
  },
  {
    name: 'Coca-Cola 1,5l',
    description: 'Coca-Cola gelada garrafa 1,5 litros',
    category: 'drinks' as const,
    price: 12.00,
    imageUrl: '',
    ingredients: ['Coca-Cola 1,5l'],
    extras: [],
    isActive: 1,
    displayOrder: 7,
  },
  {
    name: 'Coca-Cola 1,5l Zero',
    description: 'Coca-Cola Zero gelada garrafa 1,5 litros',
    category: 'drinks' as const,
    price: 12.00,
    imageUrl: '',
    ingredients: ['Coca-Cola 1,5l Zero'],
    extras: [],
    isActive: 1,
    displayOrder: 8,
  },
];

async function updateDrinks() {
  const db = await getDb();
  if (!db) {
    console.error('DB not available');
    return;
  }

  // 1. Desativar todas as bebidas antigas
  console.log('Desativando bebidas antigas...');
  await db
    .update(menuItems)
    .set({ isActive: 0 })
    .where(eq(menuItems.category, 'drinks' as any));
  console.log('Bebidas antigas desativadas!');

  // 2. Inserir novas bebidas
  console.log('Inserindo novas bebidas...');
  for (const bebida of novasBebidas) {
    await db.insert(menuItems).values(bebida as any);
    console.log(`  ✓ ${bebida.name} — R$ ${bebida.price.toFixed(2)}`);
  }

  console.log('\n✅ Bebidas atualizadas com sucesso!');

  // 3. Verificar
  const drinks = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.category, 'drinks' as any));
  
  const active = drinks.filter(d => d.isActive === 1);
  console.log(`\n=== BEBIDAS ATIVAS (${active.length}) ===`);
  for (const d of active) {
    console.log(`  #${d.id} | ${d.name} | R$ ${d.price}`);
  }
}

updateDrinks().catch(console.error);
