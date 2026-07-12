import { getDb } from './server/db';
import { menuItems as dbMenuItems } from './drizzle/schema';
import { menuItems } from './client/src/lib/menuData';

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error('No database connection');
    return;
  }

  console.log('Seeding menu items...');

  for (const item of menuItems) {
    try {
      await db.insert(dbMenuItems).values({
        name: item.name,
        description: item.description || '',
        category: item.category as any,
        price: item.price,
        imageUrl: item.image || '',
        ingredients: item.ingredients || [],
        extras: item.availableExtras || [],
        isActive: 1,
        displayOrder: 0,
      });
      console.log(`Inserted ${item.name}`);
    } catch (e) {
      console.error(`Failed to insert ${item.name}`, e);
    }
  }

  console.log('Menu seeded successfully!');
}

seed().catch(console.error);
