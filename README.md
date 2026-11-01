# FindJob — сервис поиска работы и вакансий

Проект подключён к **PostgreSQL** через **Prisma ORM 7** (driver-адаптер `@prisma/adapter-pg`).

Правило: **нативным SQL скриптом выполняется только создание базы данных** (`db/create.sql`).
Все таблицы, связи и данные создаются исключительно средствами Prisma (миграции + seed).

## Структура

```
db/create.sql            — единственный нативный SQL: CREATE DATABASE findjob;
prisma/schema.prisma     — схема БД (Prisma 7)
prisma/migrations/       — миграция инициализации (20261019113048_init)
prisma/seed.js           — тестовые данные (npx prisma db seed)
prisma.config.ts         — CLI-конфиг Prisma 7 (путь до схемы, seed, DATABASE_URL)
.env                     — DATABASE_URL
API.md                   — описание API (маршруты, методы, роли доступа)
src/server/              — REST API на Express + Prisma Client (порт 4000)
```

## Предметная область (схема БД)

- `users` — учётные записи с ролью (`applicant` | `company` | `admin`);
- `companies` — профиль работодателя (1:1 с user);
- `applicants` — профиль соискателя (1:1 с user);
- `resumes` — резюме соискателя;
- `vacancies` — вакансии компании (зарплатная вилка, город, удалёнка, активность);
- `responses` — отклики соискателя на вакансию со статусом (`new/viewed/interview/rejected/withdrawn/hired`), уникальна пара (вакансия, соискатель);
- `reviews` — отзывы соискателей о компаниях (рейтинг 1–5), один отзыв на компанию.

## Установка и запуск

```bash
npm install

# 1. Поднять PostgreSQL и создать БД единственным нативным SQL-скриптом
psql -U postgres -f db/create.sql

# 2. Миграция инициализации схемы (все таблицы — через Prisma)
npx prisma migrate dev --name init

# 3. Заполнение тестовыми данными (по 3+ записи на таблицу)
npx prisma db seed

# 4. Запуск REST API (проверка соединения: GET /health)
node src/server/index.js
curl http://localhost:4000/health   # -> {"status":"ok","database":"connected"}
```

Описание всех маршрутов API и ролей доступа — в [API.md](./API.md).

Тестовые аккаунты после seed: `admin@findjob.ru/admin123`,
`techsolutionsinc@email.com/company123`, `ivanov@email.com/seeker123` (см. API.md).