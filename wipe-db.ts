import { createClient } from '@libsql/client';

const db = createClient({
  url: 'https://newsburguer-newsburguer.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM1NDY3NDcsImlkIjoiMDE5ZjQzYWEtOTIwMS03Y2I0LWI2YWMtMzhkMDk3N2M5N2I3Iiwia2lkIjoiT0tZMFI1clVfX2JMZjV6RGgtS2tDVmdoVnZBVlVxeHYxeWFoTmNEa3pWdyIsInJpZCI6ImExMTcyZDcxLWUzNjctNGEyOS04Yzc4LTk1MmU0NGZmNDc5YiJ9.raLjvHAzv8Rk-dgJS6xB5tw4qsoZwCmPz0UR3IyYD4wazMCtzcb29eqloxC29bgCjTp2J9o87wdfD3WFEqoRAQ',
});

async function run() {
  console.log('Connecting to Turso to wipe test data...');
  
  await db.execute(`DELETE FROM orderStatusHistory`);
  console.log('Deleted orderStatusHistory');
  
  try {
    await db.execute(`DELETE FROM ratings`);
    console.log('Deleted ratings');
  } catch (e) {}
  
  await db.execute(`DELETE FROM prizeCodes`);
  console.log('Deleted prizeCodes');
  
  await db.execute(`DELETE FROM customerRankings`);
  console.log('Deleted customerRankings');
  
  await db.execute(`DELETE FROM orders`);
  console.log('Deleted orders');
  
  await db.execute(`DELETE FROM customers`);
  console.log('Deleted customers');
  
  console.log('\\n=== SUCCESS: All test data has been deleted! ===');
}

run().catch(e => console.error('Error:', e.message));
