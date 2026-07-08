import { appRouter } from './server/routers';
import { createContext } from './server/context';

async function test() {
  const caller = appRouter.createCaller({} as any);
  try {
    const res = await caller.orders.createOrder({
      customerName: "Real Test",
      customerPhone: "99999999",
      items: [{
        name: "Burguer",
        quantity: 1,
        price: 25,
        removedIngredients: [],
        addedExtras: [],
        observations: ""
      }],
      totalAmount: 25,
      discount: 0,
      finalAmount: 25,
      deliveryType: "delivery",
      address: "Rua X",
      notes: ""
    });
    console.log("Mutation response:", res);

    const caller2 = appRouter.createCaller({} as any);
    const rankings = await caller2.ranking.getCurrent();
    console.log("Current Rankings:", rankings.weeklyRankings);
  } catch (e) {
    console.error("Mutation failed:", e);
  }
}
test();
