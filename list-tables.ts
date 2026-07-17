import { createClient } from '@libsql/client';

const db = createClient({
  url: 'https://newsburguer-newsburguer.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM1NDY3NDcsImlkIjoiMDE5ZjQzYWEtOTIwMS03Y2I0LWI2YWMtMzhkMDk3N2M5N2I3Iiwia2lkIjoiT0tZMFI1clVfX2JMZjV6RGgtS2tDVmdoVnZBVlVxeHYxeWFoTmNEa3pWdyIsInJpZCI6ImExMTcyZDcxLWUzNjctNGEyOS04Yzc4LTk1MmU0NGZmNDc5YiJ9.raLjvHAzv8Rk-dgJS6xB5tw4qsoZwCmPz0UR3IyYD4wazMCtzcb29eqloxC29bgCjTp2J9o87wdfD3WFEqoRAQ',
});

async function run() {
  const result = await db.execute(`SELECT name FROM sqlite_master WHERE type='table'`);
  console.log('Tables:');
  result.rows.forEach(row => console.log(' -', row[0]));
}

run().catch(e => console.error('Error:', e.message));
