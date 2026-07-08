import { createConnection } from 'mysql2/promise';
import { nanoid } from 'nanoid';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Parse MySQL connection string
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: url.port || 3306,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Test data
const testCustomers = [
  { phone: '41987654321', name: 'João Silva', email: 'joao@email.com' },
  { phone: '41987654322', name: 'Maria Santos', email: 'maria@email.com' },
  { phone: '41987654323', name: 'Pedro Oliveira', email: 'pedro@email.com' },
  { phone: '41987654324', name: 'Ana Costa', email: 'ana@email.com' },
  { phone: '41987654325', name: 'Carlos Mendes', email: 'carlos@email.com' },
];

const testMenuItems = [
  { name: "Classic New's", price: 24.90 },
  { name: "Fresh New's", price: 27.90 },
  { name: "Bacon New's", price: 30.90 },
  { name: "New's Supreme", price: 33.90 },
  { name: 'Refrigerante Lata', price: 6.00 },
  { name: 'Suco Natural', price: 8.00 },
];

async function seedData() {
  let connection;
  try {
    console.log('🌱 Starting seed process...');
    console.log(`📡 Connecting to database: ${config.host}`);
    connection = await createConnection(config);

    // Insert customers
    console.log('📝 Inserting customers...');
    for (const customer of testCustomers) {
      await connection.execute(
        `INSERT INTO customers (phone, name, email, totalOrders, totalSpent, createdAt, updatedAt) 
         VALUES (?, ?, ?, 0, '0', NOW(), NOW())
         ON DUPLICATE KEY UPDATE name = ?, email = ?`,
        [customer.phone, customer.name, customer.email, customer.name, customer.email]
      );
    }

    // Create orders for each customer (varying amounts)
    console.log('📦 Creating test orders...');
    const orderCounts = [8, 6, 5, 4, 3]; // Different order counts for ranking
    const now = new Date();
    let totalOrders = 0;

    for (let i = 0; i < testCustomers.length; i++) {
      const customer = testCustomers[i];
      const orderCount = orderCounts[i];

      for (let j = 0; j < orderCount; j++) {
        // Create order date within current week/month
        const orderDate = new Date(now);
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 28)); // Last 28 days

        // Random items for order
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const selectedItems = [];
        let orderTotal = 0;

        for (let k = 0; k < itemCount; k++) {
          const item = testMenuItems[Math.floor(Math.random() * testMenuItems.length)];
          const quantity = Math.floor(Math.random() * 2) + 1;
          selectedItems.push({
            name: item.name,
            quantity: quantity,
            price: item.price,
          });
          orderTotal += item.price * quantity;
        }

        // Insert order
        const orderNumber = nanoid(8).toUpperCase();
        await connection.execute(
          `INSERT INTO orders 
           (orderNumber, customerName, customerPhone, items, totalAmount, discount, finalAmount, 
            deliveryType, address, status, createdAt, updatedAt, estimatedDeliveryTime) 
           VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 'delivered', ?, NOW(), ?)`,
          [
            orderNumber,
            customer.name,
            customer.phone,
            JSON.stringify(selectedItems),
            orderTotal,
            orderTotal,
            Math.random() > 0.5 ? 'delivery' : 'pickup',
            Math.random() > 0.5 ? 'Rua das Hamburgueres, 123' : null,
            orderDate,
            new Date(orderDate.getTime() + 45 * 60000),
          ]
        );

        console.log(`  ✓ Order #${orderNumber} created for ${customer.name} (${j + 1}/${orderCount})`);
        totalOrders++;
      }
    }

    console.log('✅ Seed completed successfully!');
    console.log('📊 Data summary:');
    console.log(`  - ${testCustomers.length} customers created`);
    console.log(`  - ${totalOrders} orders created`);
    console.log('\n💡 Rankings will be calculated automatically when you visit /ranking');

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedData();
