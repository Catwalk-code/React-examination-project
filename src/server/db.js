// Фабрика Prisma Client для серверной части (Prisma 7 + driver-адаптер pg).
// Создание БД — только нативным SQL (db/create.sql), всё остальное — через Prisma.
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL не задан в файле .env');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
