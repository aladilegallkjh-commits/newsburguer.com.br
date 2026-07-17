import { getMenuItems } from './server/db';

async function run() {
  try {
    const items = await getMenuItems();
    console.log(`Regular menu items: ${items.length}`);
    const categories = new Set(items.map(i => i.category));
    console.log(`Categories:`, Array.from(categories));
  } catch (e) {
    console.error("Error calling getMenuItems:", e);
  }
}
run();
