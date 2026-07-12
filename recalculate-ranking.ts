import { createClient } from '@libsql/client';
const db = createClient({ url: 'file:./local.db' });

async function run() {
  // Remove old test entry
  await db.execute("DELETE FROM orders WHERE customerPhone = '123'");
  await db.execute("DELETE FROM customers WHERE phone = '123'");
  console.log('Removed old test data');

  // Recalculate ranking
  await db.execute("DELETE FROM customerRankings");

  const top = await db.execute(`
    SELECT c.id as customerId, c.phone, c.name, COUNT(o.id) as orderCount, SUM(o.finalAmount) as totalSpent
    FROM customers c
    LEFT JOIN orders o ON o.customerPhone = c.phone
    GROUP BY c.id
    ORDER BY COUNT(o.id) DESC, SUM(o.finalAmount) DESC
    LIMIT 5
  `);

  for (let i = 0; i < top.rows.length; i++) {
    const c = top.rows[i];
    const weekPrize = i === 0 ? 'hamburger_kids' : 'none';
    const monthPrize = i === 0 ? 'combo_free' : 'none';
    await db.execute({
      sql: `INSERT INTO customerRankings (customerId, period, position, orderCount, totalSpent, prizeWon) VALUES (?, 'week', ?, ?, ?, ?)`,
      args: [c.customerId, i+1, c.orderCount, c.totalSpent, weekPrize]
    });
    await db.execute({
      sql: `INSERT INTO customerRankings (customerId, period, position, orderCount, totalSpent, prizeWon) VALUES (?, 'month', ?, ?, ?, ?)`,
      args: [c.customerId, i+1, c.orderCount, c.totalSpent, monthPrize]
    });
  }

  const result = await db.execute(`
    SELECT cr.period, cr.position, c.name, cr.orderCount, cr.totalSpent 
    FROM customerRankings cr 
    LEFT JOIN customers c ON cr.customerId = c.id 
    ORDER BY cr.period, cr.position
  `);

  console.log('\n=== RANKING FINAL ===');
  for (const r of result.rows) {
    console.log(`  [${r.period}] ${r.position}. ${r.name} | R$${r.totalSpent}`);
  }
}

run().catch(console.error);
