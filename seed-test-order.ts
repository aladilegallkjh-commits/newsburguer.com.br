import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';

const db = createClient({ url: 'file:./local.db' });

async function run() {
  const phone = '41987019702';
  const name = 'Leonardo Mateus';
  const finalAmount = 35.90;

  // 1. Insert order
  const orderNumber = `ORD-${new Date().toISOString().split('T')[0]}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  await db.execute({
    sql: `INSERT INTO orders (orderNumber, customerId, customerName, customerPhone, items, totalAmount, discount, finalAmount, deliveryType, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [orderNumber, phone, name, phone, JSON.stringify([{ name: 'X-Burguer', quantity: 1, price: 35.90 }]), finalAmount, 0, finalAmount, 'delivery', 'pending']
  });
  console.log(`Order created: ${orderNumber}`);

  // 2. Check if customer exists, update or insert
  const existing = await db.execute({ sql: `SELECT * FROM customers WHERE phone = ?`, args: [phone] });

  if (existing.rows.length > 0) {
    const cur = existing.rows[0];
    await db.execute({
      sql: `UPDATE customers SET name = ?, totalOrders = totalOrders + 1, totalSpent = totalSpent + ? WHERE phone = ?`,
      args: [name, finalAmount, phone]
    });
    console.log(`Customer updated: ${name}`);
  } else {
    await db.execute({
      sql: `INSERT INTO customers (phone, name, totalOrders, totalSpent) VALUES (?, ?, 1, ?)`,
      args: [phone, name, finalAmount]
    });
    console.log(`Customer created: ${name}`);
  }

  // 3. Get the customer id
  const cust = await db.execute({ sql: `SELECT * FROM customers WHERE phone = ?`, args: [phone] });
  const customerId = cust.rows[0].id;

  // 4. Clear and recalculate weekly ranking
  await db.execute(`DELETE FROM customerRankings WHERE period = 'week'`);

  const topCustomers = await db.execute(`
    SELECT c.id as customerId, c.phone, c.name, COUNT(o.id) as orderCount, SUM(o.finalAmount) as totalSpent
    FROM customers c
    LEFT JOIN orders o ON o.customerPhone = c.phone
    GROUP BY c.id
    ORDER BY COUNT(o.id) DESC
    LIMIT 5
  `);

  for (let i = 0; i < topCustomers.rows.length; i++) {
    const c = topCustomers.rows[i];
    const prizeType = i === 0 ? 'hamburger_kids' : 'none';
    await db.execute({
      sql: `INSERT INTO customerRankings (customerId, period, position, orderCount, totalSpent, prizeWon) VALUES (?, 'week', ?, ?, ?, ?)`,
      args: [c.customerId, i + 1, c.orderCount, c.totalSpent, prizeType]
    });
  }
  console.log('Rankings updated!');

  // 5. Verify
  const result = await db.execute(`
    SELECT cr.position, c.name, cr.orderCount, cr.totalSpent 
    FROM customerRankings cr
    LEFT JOIN customers c ON cr.customerId = c.id
    WHERE cr.period = 'week'
    ORDER BY cr.position
  `);

  console.log('\n=== RANKING NOW ===');
  for (const r of result.rows) {
    console.log(`  ${r.position}. ${r.name} | pedidos: ${r.orderCount} | total: R$${r.totalSpent}`);
  }
}

run().catch(console.error);
