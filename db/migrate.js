// Применяет db/schema.sql и db/seed.sql к PostgreSQL.
// Запуск: npm run db:migrate
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
//ищем .env в корне проекта
dotenv.config({ path: path.join(rootDir, '.env') })

const dbName = process.env.PGDATABASE || 'examination'

// сначала подключаемся к служебной БД postgres, чтобы создать рабочую, если её нет
const admin = new pg.Client({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: 'postgres',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456'
})

await admin.connect()
const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
if (!exists.rowCount) {
  await admin.query(`CREATE DATABASE ${pg.escapeIdentifier(dbName)}`)
  console.log(`Создана база данных "${dbName}"`)
}
await admin.end()

const client = new pg.Client({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: dbName,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456'
})

await client.connect()
for (const file of ['db/schema.sql', 'db/seed.sql']) {
  const sql = fs.readFileSync(path.join(rootDir, file), 'utf8')
  await client.query(sql)
  console.log(`Применён ${file}`)
}
await client.end()
console.log('Миграция завершена.')
