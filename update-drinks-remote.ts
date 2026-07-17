import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { menuItems } from './drizzle/schema';

const client = createClient({
  url: 'libsql://newsburguer-newsburguer.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM1NDY3NDcsImlkIjoiMDE5ZjQzYWEtOTIwMS03Y2I0LWI2YWMtMzhkMDk3N2M5N2I3Iiwia2lkIjoiT0tZMFI1clVfX2JMZjV6RGgtS2tDVmdoVnZBVlVxeHYxeWFoTmNEa3pWdyIsInJpZCI6ImExMTcyZDcxLWUzNjctNGEyOS04Yzc4LTk1MmU0NGZmNDc5YiJ9.raLjvHAzv8Rk-dgJS6xB5tw4qsoZwCmPz0UR3IyYD4wazMCtzcb29eqloxC29bgCjTp2J9o87wdfD3WFEqoRAQ',
});

const db = drizzle(client);

const novasBebidas = [
  { name: 'Água Sem Gás 510ml',    description: 'Água mineral sem gás gelada 510ml',             price: 4.50,  displayOrder: 1 },
  { name: 'Água Com Gás 510ml',    description: 'Água mineral com gás gelada 510ml',              price: 5.00,  displayOrder: 2 },
  { name: 'Coca-Cola 310ml',       description: 'Coca-Cola gelada lata 310ml',                    price: 5.50,  displayOrder: 3 },
  { name: 'Coca-Cola 350ml',       description: 'Coca-Cola gelada lata 350ml',                    price: 6.00,  displayOrder: 4 },
  { name: 'Coca-Cola 350ml Zero',  description: 'Coca-Cola Zero gelada lata 350ml',               price: 6.00,  displayOrder: 5 },
  { name: 'Pepsi 350ml',           description: 'Pepsi gelada lata 350ml',                        price: 5.50,  displayOrder: 6 },
  { name: 'Coca-Cola 1,5l',        description: 'Coca-Cola gelada garrafa 1,5 litros',            price: 12.00, displayOrder: 7 },
  { name: 'Coca-Cola 1,5l Zero',   description: 'Coca-Cola Zero gelada garrafa 1,5 litros',      price: 12.00, displayOrder: 8 },
];

async function run() {
  console.log('🔗 Conectando ao Turso (produção)...');

  // 1. Desativar bebidas antigas
  console.log('❌ Desativando bebidas antigas...');
  await db.update(menuItems)
    .set({ isActive: 0 })
    .where(eq(menuItems.category, 'drinks' as any));
  console.log('   Bebidas antigas desativadas!');

  // 2. Inserir novas bebidas
  console.log('✅ Inserindo novas bebidas...');
  for (const b of novasBebidas) {
    await db.insert(menuItems).values({
      name: b.name,
      description: b.description,
      category: 'drinks' as any,
      price: b.price,
      imageUrl: '',
      ingredients: [],
      extras: [],
      isActive: 1,
      displayOrder: b.displayOrder,
    });
    console.log(`   ✓ ${b.name} — R$ ${b.price.toFixed(2)}`);
  }

  // 3. Confirmar
  const ativas = await db.select()
    .from(menuItems)
    .where(eq(menuItems.category, 'drinks' as any));
  
  const confirmadas = ativas.filter(d => d.isActive === 1);
  console.log(`\n=== BEBIDAS ATIVAS NO TURSO (${confirmadas.length}) ===`);
  for (const d of confirmadas) {
    console.log(`  #${d.id} | ${d.name} | R$ ${d.price}`);
  }

  console.log('\n🎉 Pronto! Bebidas atualizadas em produção.');
}

run().catch(console.error);
