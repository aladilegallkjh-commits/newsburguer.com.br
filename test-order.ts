import { getDb, createOrder } from './server/db';
import { updateCustomerStats, calculateWeeklyRankings } from './server/ranking';

async function test() {
  try {
    const order = await createOrder({
      orderNumber: "TEST-001",
      customerId: "123",
      customerName: "Test",
      customerPhone: "123",
      items: [],
      totalAmount: 10,
      discount: 0,
      finalAmount: 10,
      deliveryType: "delivery",
      address: "test",
      notes: "",
      status: "pending",
    });
    console.log("Order created:", order);

    await updateCustomerStats("123", 10);
    console.log("Stats updated");

    await calculateWeeklyRankings();
    console.log("Rankings calculated");

    const db = await getDb();
    const rankings = await db!.execute('SELECT * FROM customerRankings');
    console.log("Rankings in DB:", rankings.rows);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
