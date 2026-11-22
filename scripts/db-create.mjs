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

// pg.Client выполняет по одному запросу за вызов query(),
// поэтому разбиваем скрипт на отдельные инструкции.
const statements = sql
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

const client = new pg.Client({ connectionString: adminUrl });
await client.connect();
try {
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log(`Выполнено: ${stmt.replace(/\s+/g, ' ')}`);
    } catch (e) {
      // Идемпотентность: если база уже существует (42P04) — не ошибка.
      if (e.code === '42P04') {
        console.log(`База данных "${dbName}" уже существует — пропускаем.`);
      } else {
        throw e;
      }
    }
  }
} finally {
  await client.end();
}
console.log('Скрипт db/create.sql выполнен.');
