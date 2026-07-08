import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('//')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3]?.split('?')[0] || 'newsburguer',
  ssl: 'amazon',
});

const password = '124@Leonardo';
const hashedPassword = await bcrypt.hash(password, 10);

try {
  await connection.execute(
    'INSERT INTO users (id, name, email, role, password, createdAt) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE password = ?',
    ['admin-leonardo', 'Leonardo Admin', 'admin@newsburguer.com', 'admin', hashedPassword, hashedPassword]
  );
  console.log('✅ Admin criado/atualizado com sucesso!');
  console.log('Email: admin@newsburguer.com');
  console.log('Senha: 124@Leonardo');
} catch (error) {
  console.error('❌ Erro:', error.message);
}

await connection.end();
