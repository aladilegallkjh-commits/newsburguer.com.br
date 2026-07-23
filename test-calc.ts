import { getStoreSettings } from './server/db';

async function testCalc() {
  const settings = await getStoreSettings();
  console.log('Store Settings:', settings);
  
  const storeLat = settings?.storeLatitude;
  const storeLon = settings?.storeLongitude;
  
  if (!storeLat || !storeLon) {
    console.log('No store coordinates set.');
  } else {
    console.log('Store coordinates:', storeLat, storeLon);
  }
}

testCalc().catch(console.error);
