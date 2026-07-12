import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://newsburguer-newsburguer.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM1NDY3NDcsImlkIjoiMDE5ZjQzYWEtOTIwMS03Y2I0LWI2YWMtMzhkMDk3N2M5N2I3Iiwia2lkIjoiT0tZMFI1clVfX2JMZjV6RGgtS2tDVmdoVnZBVlVxeHYxeWFoTmNEa3pWdyIsInJpZCI6ImExMTcyZDcxLWUzNjctNGEyOS04Yzc4LTk1MmU0NGZmNDc5YiJ9.raLjvHAzv8Rk-dgJS6xB5tw4qsoZwCmPz0UR3IyYD4wazMCtzcb29eqloxC29bgCjTp2J9o87wdfD3WFEqoRAQ',
});

async function run() {
  // List all customers
  const allCustomers = await db.execute(`SELECT id, phone, name FROM customers`);
  console.log(`\n=== CUSTOMERS (${allCustomers.rows.length}) ===`);
  for (const c of allCustomers.rows) {
    console.log(`  #${c.id} | ${c.phone} | name="${c.name}"`);
  }

  // Fix customers still named "Cliente"
  for (const customer of allCustomers.rows) {
    if (customer.name === 'Cliente') {
      const order = await db.execute({
        sql: `SELECT customerName FROM orders WHERE customerPhone = ? ORDER BY createdAt DESC LIMIT 1`,
        args: [customer.phone as string],
      });
      if (order.rows.length > 0 && order.rows[0].customerName) {
        const realName = order.rows[0].customerName as string;
        await db.execute({
          sql: `UPDATE customers SET name = ? WHERE id = ?`,
          args: [realName, customer.id as number],
        });
        console.log(`  Fixed: ${customer.phone} → "${realName}"`);
      }
    }
  }

  // Recalculate rankings
  await db.execute(`DELETE FROM customerRankings`);

  const top = await db.execute(`
    SELECT c.id as customerId, c.phone, c.name, COUNT(o.id) as orderCount, SUM(o.finalAmount) as totalSpent
    FROM customers c
    LEFT JOIN orders o ON o.customerPhone = c.phone AND o.status != 'cancelled'
    GROUP BY c.id
    ORDER BY COUNT(o.id) DESC, SUM(o.finalAmount) DESC
    LIMIT 5
  `);

  for (let i = 0; i < top.rows.length; i++) {
    const c = top.rows[i];
    await db.execute({
      sql: `INSERT INTO customerRankings (customerId, period, position, orderCount, totalSpent, prizeWon) VALUES (?, 'week', ?, ?, ?, ?)`,
      args: [c.customerId, i + 1, c.orderCount, c.totalSpent, i === 0 ? 'hamburger_kids' : 'none']
    });
    await db.execute({
      sql: `INSERT INTO customerRankings (customerId, period, position, orderCount, totalSpent, prizeWon) VALUES (?, 'month', ?, ?, ?, ?)`,
      args: [c.customerId, i + 1, c.orderCount, c.totalSpent, i === 0 ? 'combo_free' : 'none']
    });
  }

  // Show result
  const result = await db.execute(`
    SELECT cr.period, cr.position, c.name, cr.orderCount, cr.totalSpent
    FROM customerRankings cr
    LEFT JOIN customers c ON cr.customerId = c.id
    ORDER BY cr.period, cr.position
  `);

  console.log('\n=== RANKING FINAL ===');
  for (const r of result.rows) {
    console.log(`  [${r.period}] ${r.position}. ${r.name} | pedidos: ${r.orderCount} | R$${r.totalSpent}`);
  }

  console.log('\nDone!');
}

run().catch(console.error);
