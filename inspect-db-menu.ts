import { getDb } from './server/db';
import { menuItems } from './drizzle/schema';

async function inspectMenu() {
  const db = await getDb();
  if (!db) { console.error('DB not available'); return; }

  const items = await db.select().from(menuItems);
  console.log(`\n=== MENU ITEMS (${items.length}) ===`);
  for (const item of items) {
    console.log(`  #${item.id} | ${item.name} | ${item.category} | R$ ${item.price} | active=${item.isActive}`);
  }
}

inspectMenu().catch(console.error);
