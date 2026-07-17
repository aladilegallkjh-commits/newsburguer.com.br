import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { menuItems } from './drizzle/schema';

const client = createClient({
  url: 'libsql://newsburguer-newsburguer.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM1NDY3NDcsImlkIjoiMDE5ZjQzYWEtOTIwMS03Y2I0LWI2YWMtMzhkMDk3N2M5N2I3Iiwia2lkIjoiT0tZMFI1clVfX2JMZjV6RGgtS2tDVmdoVnZBVlVxeHYxeWFoTmNEa3pWdyIsInJpZCI6ImExMTcyZDcxLWUzNjctNGEyOS04Yzc4LTk1MmU0NGZmNDc5YiJ9.raLjvHAzv8Rk-dgJS6xB5tw4qsoZwCmPz0UR3IyYD4wazMCtzcb29eqloxC29bgCjTp2J9o87wdfD3WFEqoRAQ',
});

const db = drizzle(client);

// Mapeamento: nome do lanche → imagem
const updates = [
  // Foto 1: New's Cheddar Flood
  { name: "New's Cheddar Flood", imageUrl: '/uploads/burger_cheddar_flood.png' },
  // Foto 2: New's Supreme
  { name: "New's Supreme", imageUrl: '/uploads/burger_supreme.png' },
  // Foto 3: New's Fresh
  { name: "New's Fresh", imageUrl: '/uploads/burger_fresh.png' },
  // Foto 4: New's Prime
  { name: "New's Prime", imageUrl: '/uploads/burger_prime.png' },
  // Foto 5: New's Rings (corrigido pelo usuário)
  { name: "New's Rings", imageUrl: '/uploads/burger_rings.png' },
];

async function run() {
  console.log('🔗 Conectando ao Turso...');

  for (const upd of updates) {
    await db.update(menuItems)
      .set({ imageUrl: upd.imageUrl })
      .where(eq(menuItems.name, upd.name));
    console.log(`  ✓ ${upd.name} → ${upd.imageUrl}`);
  }

  console.log('\n🎉 Fotos atualizadas em produção!');
}

run().catch(console.error);
