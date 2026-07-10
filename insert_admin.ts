import { getDb } from './server/db'; 
import { adminUsers } from './drizzle/schema'; 
import * as crypto from 'crypto'; 

async function run() {
  const db = await getDb();
  if (!db) throw new Error("DB not found");
  const res = await db.insert(adminUsers).values({ 
    email: 'newsburguer5@gmail.com', 
    passwordHash: crypto.createHash('sha256').update('admin123').digest('hex'), 
    name: 'Admin', 
    role: 'owner', 
    isActive: 1 
  });
  console.log(res);
}

run().catch(console.error);
