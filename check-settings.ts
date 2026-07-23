import 'dotenv/config';
import { getDb } from './server/db.ts';
import { storeSettings } from './drizzle/schema.ts';

async function main() {
  const db = await getDb();
  if (!db) return;
  const settings = await db.select().from(storeSettings);
  console.log(settings);
}
main().catch(console.error);
