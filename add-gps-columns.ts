import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  console.log('Adicionando colunas de GPS e tracking...');
  
  const client = createClient({
    url: process.env.DATABASE_URL || 'file:./local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const columns = [
    { name: 'driverLatitude', type: 'REAL' },
    { name: 'driverLongitude', type: 'REAL' },
    { name: 'trackingToken', type: 'TEXT' },
  ];

  for (const col of columns) {
    try {
      await client.execute(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✅ ${col.name} adicionado`);
    } catch (e: any) {
      if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
        console.log(`ℹ️ ${col.name} já existe`);
      } else {
        console.error(`Erro ${col.name}:`, e.message);
      }
    }
  }

  console.log('✅ Migração de GPS concluída!');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
