import { getDb } from './server/db';
import { promotions } from './drizzle/schema';

async function seedPromo() {
  console.log('Inserindo promoção...');
  try {
    const db = await getDb();
    if (!db) throw new Error('DB not available');
    await db.insert(promotions).values({
      title: 'Combo Explosão + Fritas',
      description: 'Dois hambúrgueres artesanais, queijo cheddar, bacon, alface, tomate e uma porção de fritas.',
      type: 'combo',
      discountValue: 39.90,
      imageUrl: 'https://images.unsplash.com/photo-1594212691516-748afc8d20ce?auto=format&fit=crop&q=80',
      isActive: 1,
      displayOrder: 0
    });
    console.log('Promoção inserida com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inserir promoção:', error);
    process.exit(1);
  }
}

seedPromo();
