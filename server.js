// Сервер REST API поверх PostgreSQL.
// Заменяет json-server-auth + db.json (db.json остаётся в репозитории как архив, но не используется).
//
// Запуск:  npm run server        (сервер на http://localhost:4000)
// Миграции: npm run db:migrate   (применяет db/schema.sql и db/seed.sql)
//
// Параметры подключения берутся из переменных окружения или .env:
//   PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import pg from 'pg'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const PORT = Number(process.env.PORT || 4000)

const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'examination',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456'
})

const app = express()
app.use(cors())
app.use(express.json())

// ---------- helpers ----------

// camelCase ( фронтенд ) <-> snake_case ( БД )
const CAMEL = {
  companyId: 'company_id',
  seekerId: 'seeker_id',
  resumeId: 'resume_id',
  vacancyId: 'vacancy_id',
  authorId: 'author_id',
  userId: 'user_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
}
const SNAKE = Object.fromEntries(Object.entries(CAMEL).map(([c, s]) => [s, c]))

//числовые поля — pg отдаёт BIGINT строкой, а фронтенд сравнивает через ===
const NUM_FIELDS = new Set(['id', 'companyId', 'seekerId', 'resumeId', 'vacancyId', 'authorId', 'userId', 'rating'])

const toDb = (obj) => {
  const out = {}
  for (const [k, v] of Object.entries(obj)) out[CAMEL[k] || k] = v
  return out
}
const toApi = (row) => {
  if (!row) return row
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    const key = SNAKE[k] || k
    let val = v
    if (NUM_FIELDS.has(key) && val !== null && val !== undefined) val = Number(val)
    out[key] = val instanceof Date ? val.toISOString() : val
  }
  return out
}

// пропускает только те колонки, что реально есть в таблице
const pickColumns = async (table, data) => {
  const { rows } = await pool.query(
    'SELECT column_name FROM information_schema.columns WHERE table_name = $1',
    [table]
  )
  const allowed = new Set(rows.map((r) => r.column_name))
  return Object.fromEntries(Object.entries(data).filter(([k, v]) => allowed.has(k) && v !== undefined))
}

const wrap = (handler) => (req, res) =>
  handler(req, res).catch((err) => {
    console.error(err)
    res.status(500).json({ error: err.message || 'Ошибка сервера' })
  })

// ---------- auth ----------

const auth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Недействительный токен' })
  }
}

app.post(
  '/register',
  wrap(async (req, res) => {
    const { email, password, name, role } = req.body || {}
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Заполните email, пароль и имя' })
    }
    const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email])
    if (exists.rowCount) return res.status(409).json({ error: 'Пользователь уже существует' })

    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hash, name, role === 'company' ? 'company' : 'seeker']
    )
    const user = rows[0]
    res.status(201).json({ user, accessToken: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' }) })
  })
)

app.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password } = req.body || {}
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email || ''])
    const dbUser = rows[0]
    if (!dbUser || !(await bcrypt.compare(password || '', dbUser.password))) {
      return res.status(401).json({ error: 'Неверные данные' })
    }
    const user = { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role }
    res.json({ user, accessToken: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' }) })
  })
)

// ---------- CRUD-фабрика (совместима с json-server) ----------

const TABLES = {
  users: { table: 'users', public: true },          // чтение без токена — как раньше
  vacancies: { table: 'vacancies' },
  resumes: { table: 'resumes' },
  applications: { table: 'applications' },
  reviews: { table: 'reviews' }
}

for (const [resource, cfg] of Object.entries(TABLES)) {
  const readGuard = cfg.public ? (req, res, next) => next() : auth

  app.get(`/${resource}`, readGuard, wrap(async (req, res) => {
    const { rows } = await pool.query(`SELECT * FROM ${cfg.table} ORDER BY id`)
    // пароли наружу не отдаём
    const data = rows.map(toApi).map((r) => { delete r.password; return r })
    res.json(data)
  }))

  app.get(`/${resource}/:id`, readGuard, wrap(async (req, res) => {
    const { rows } = await pool.query(`SELECT * FROM ${cfg.table} WHERE id = $1`, [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Не найдено' })
    const data = toApi(rows[0]); delete data.password
    res.json(data)
  }))

  app.post(`/${resource}`, auth, wrap(async (req, res) => {
    const cols = await pickColumns(cfg.table, toDb(req.body || {}))
    const keys = Object.keys(cols)
    if (!keys.length) return res.status(400).json({ error: 'Пустой запрос' })
    const sql =
      `INSERT INTO ${cfg.table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`
    const { rows } = await pool.query(sql, keys.map((k) => cols[k]))
    const data = toApi(rows[0]); delete data.password
    res.status(201).json(data)
  }))

  // json-server PUT заменяет запись целиком: делаем UPSERT по id,
  // чтобы PUT по существующему id всегда возвращал 2xx (как раньше)
  app.put(`/${resource}/:id`, auth, wrap(async (req, res) => {
    const cols = await pickColumns(cfg.table, toDb({ ...(req.body || {}), id: Number(req.params.id) }))
    const keys = Object.keys(cols)
    if (!keys.includes('id')) return res.status(400).json({ error: 'Нет id' })
    const updates = keys.filter((k) => k !== 'id')
    let sql, params
    if (updates.length) {
      sql =
        `INSERT INTO ${cfg.table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) ` +
        `ON CONFLICT (id) DO UPDATE SET ${updates.map((u) => `${u} = EXCLUDED.${u}`).join(', ')} RETURNING *`
      params = keys.map((k) => cols[k])
    } else {
      sql = `INSERT INTO ${cfg.table} (id) VALUES ($1) ON CONFLICT (id) DO NOTHING RETURNING *`
      params = [cols.id]
    }
    const { rows } = await pool.query(sql, params)
    if (!rows.length) return res.status(404).json({ error: 'Не найдено' })
    const data = toApi(rows[0]); delete data.password
    res.json(data)
  }))

  app.patch(`/${resource}/:id`, auth, wrap(async (req, res) => {
    const cols = await pickColumns(cfg.table, toDb(req.body || {}))
    const keys = Object.keys(cols).filter((k) => k !== 'id')
    if (!keys.length) return res.status(400).json({ error: 'Нечего обновлять' })
    const sql =
      `UPDATE ${cfg.table} SET ${keys.map((k, i) => `${k} = $${i + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING *`
    const { rows } = await pool.query(sql, [...keys.map((k) => cols[k]), req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Не найдено' })
    const data = toApi(rows[0]); delete data.password
    res.json(data)
  }))

  app.delete(`/${resource}/:id`, auth, wrap(async (req, res) => {
    const { rowCount } = await pool.query(`DELETE FROM ${cfg.table} WHERE id = $1`, [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Не найдено' })
    res.status(204).end()
  }))
}

app.listen(PORT, () => {
  console.log(`API (PostgreSQL) запущен: http://localhost:${PORT}`)
})
