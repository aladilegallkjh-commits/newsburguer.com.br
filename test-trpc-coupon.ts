import 'dotenv/config';
import { appRouter } from './server/routers.ts';
import { getDb } from './server/db.ts';
import { db } from './server/db.ts';

async function main() {
  const dbInst = await getDb();
  if (!dbInst) return;
  const caller = appRouter.createCaller({ user: { role: 'admin', id: 1, email: 'admin@admin.com' }, req: {} as any, res: {} as any });
  try {
    const result = await caller.coupons.create({ code: 'TRPCTEST', type: 'percentage', discountValue: 15 });
    console.log("TRPC Create Success:", result);
  } catch (error) {
    console.error("TRPC Create Error:", error);
  }
}
main().catch(console.error);
