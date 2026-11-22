// Конфигурация Prisma 7 (CLI-конфиг).
// Здесь указываются: путь к схеме, путь к миграциям и способ загрузки DATABASE_URL.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
