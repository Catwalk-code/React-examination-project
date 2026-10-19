// Скрипт загрузки данных из db.json в PostgreSQL.
// Создаёт базу (если её нет), применяет db/schema.sql и переносит все записи из db.json.
// Пароли пользователей из db.json (bcrypt-хеш, соответствующий паролю из db.json (в проекте используется пароль 123456)) переносятся как есть.
//
// Запуск: npm run db:import   (или node db/import-from-json.js)
// Параметры подключения берутся из переменных окружения или .env (пароль по умолчанию 123456).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
dotenv.config({ path: path.join(rootDir, '.env') })

const DB = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456'
}
const dbName = process.env.PGDATABASE || 'examination'

// ---------- 1. создать базу, если её нет ----------
const admin = new pg.Client({ ...DB, database: 'postgres' })
await admin.connect()
const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
if (!exists.rowCount) {
  await admin.query(`CREATE DATABASE ${pg.escapeIdentifier(dbName)}`)
  console.log(`Создана база данных "${dbName}"`)
}
await admin.end()

// ---------- 2. применить схему ----------
const client = new pg.Client({ ...DB, database: dbName })
await client.connect()
const schemaSql = fs.readFileSync(path.join(rootDir, 'db', 'schema.sql'), 'utf8')
await client.query(schemaSql)
console.log('Применён db/schema.sql')

// ---------- 3. прочитать db.json ----------
const json = JSON.parse(fs.readFileSync(path.join(rootDir, 'db.json'), 'utf8'))

// таблица БД -> поле в db.json -> соответствие колонок apiField: dbColumn
const TABLES = [
  { table: 'users',        field: 'users',      map: { email: 'email', password: 'password', name: 'name', role: 'role' } },
  { table: 'vacancies',    field: 'vacancies',  map: { companyId: 'company_id', createdAt: 'created_at', updatedAt: 'updated_at' } },
  { table: 'resumes',      field: 'resumes',    map: { userId: 'user_id', createdAt: 'created_at', updatedAt: 'updated_at' } },
  { table: 'applications', field: 'applications', map: { type: 'type', seekerId: 'seeker_id', resumeId: 'resume_id', vacancyId: 'vacancy_id', status: 'status', message: 'message', createdAt: 'created_at', updatedAt: 'updated_at' } },
  { table: 'reviews',      field: 'reviews',    map: { companyId: 'company_id', authorId: 'author_id', userId: 'user_id', rating: 'rating', text: 'text', createdAt: 'created_at' } }
]

for (const { table, field, map } of TABLES) {
  const records = json[field] || []
  // колонки, реально существующие в таблице
  const { rows: cols } = await client.query(
    'SELECT column_name FROM information_schema.columns WHERE table_name = $1',
    [table]
  )
  const allowed = new Set(cols.map((r) => r.column_name))

  for (const rec of records) {
    const row = { id: rec.id }
    for (const [k, v] of Object.entries(rec)) {
      const col = map[k] || k // поля без маппинга совпадают (title, description, ...)
      if (allowed.has(col) && v !== undefined) row[col] = v
    }
    const columns = Object.keys(row)
    const values = columns.map((c) => row[c])
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
    await client.query(
      `INSERT INTO ${pg.escapeIdentifier(table)} (${columns.map(pg.escapeIdentifier).join(', ')})
       VALUES (${placeholders})
       ON CONFLICT (id) DO NOTHING`,
      values
    )
  }
  // восстановить последовательности после вставки явных id
  await client.query(
    `SELECT setval(pg_get_serial_sequence('${table}', 'id'),
            (SELECT COALESCE(MAX(id), 1) FROM ${pg.escapeIdentifier(table)}))`
  )
  console.log(`Перенесено в "${table}": ${records.length} записей`)
}

await client.end()
console.log(`Импорт db.json в базу "${dbName}" завершён.`)
