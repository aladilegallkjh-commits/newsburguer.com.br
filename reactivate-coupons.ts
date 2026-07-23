import 'dotenv/config';
import { getDb } from './server/db.ts';
import { coupons } from './drizzle/schema.ts';
import { eq, inArray } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) return;

  // Reativar MEUNEWS e MIQUEIAS
  const result = await db.update(coupons)
    .set({ isActive: 1 })
    .where(inArray(coupons.code, ['MEUNEWS', 'MIQUEIAS']));

  console.log("Cupons reativados:", result);

  // Confirmar
  const active = await db.select().from(coupons).where(eq(coupons.isActive, 1));
  console.log("Cupons ativos agora:", active.map(c => c.code));
}
main().catch(console.error);
