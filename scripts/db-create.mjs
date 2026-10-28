// Создание базы данных нативным SQL-скриптом db/create.sql.
// Единственная операция над БД, которая выполняется «руками», а не через Prisma.
import { readFileSync } from 'node:fs';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL не задан (.env)');

const target = new URL(url);
const dbName = target.pathname.slice(1); // имя БД из DATABASE_URL
const adminUrl = `${target.protocol}//${target.username}:${target.password}@${target.hostname}:${target.port || 5432}/postgres`;

const sql = readFileSync(new URL('../db/create.sql', import.meta.url), 'utf8');

const client = new pg.Client({ connectionString: adminUrl });
await client.connect();
try {
  const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE ${JSON.stringify(dbName).replace(/"/g, '"')}`);
    console.log(`База данных "${dbName}" создана.`);
  } else {
    console.log(`База данных "${dbName}" уже существует.`);
  }
} finally {
  await client.end();
}

// Выполняем сам SQL-скрипт уже внутри созданной БД (идемпотентно: CREATE IF NOT EXISTS).
const db = new pg.Client({ connectionString: url });
await db.connect();
try {
  await db.query(sql);
  console.log('Скрипт db/create.sql выполнен.');
} finally {
  await db.end();
}
