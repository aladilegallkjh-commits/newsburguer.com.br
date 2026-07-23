import { updateStoreSettings } from './server/db';

async function test() {
  try {
    await updateStoreSettings({ isOpen: 1 });
    console.log('Successfully inserted store settings');
  } catch (e) {
    console.error('Error inserting store settings:', e);
  }
}
test();
