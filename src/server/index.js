// Точка входа REST API проекта FindJob (порт 4000).
// Все данные читаются/пишутся через Prisma Client (Prisma 7 + адаптер pg).
import express from 'express';
import 'dotenv/config';

import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';
import vacancyRouter from './routes/vacancies.js';
import resumeRouter from './routes/resumes.js';
import responseRouter from './routes/responses.js';
import applicationRouter from './routes/applications.js';
import { companyRouter } from './routes/companies.js';
import { reviewRouter } from './routes/reviews.js';
import { prisma } from './db.js';

const app = express();
app.use(express.json());

// CORS — фронтенд (Vite, порт 5173) обращается к API напрямую (порт 4000)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Проверка соединения с базой данных
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', database: String(e.message || e) });
  }
});

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/vacancy', vacancyRouter);
// Алиасы «старых» путей json-server, на которые ориентируется фронтенд
app.use('/vacancies', vacancyRouter);
app.use('/resume', resumeRouter);
app.use('/resumes', resumeRouter);
app.use('/response', responseRouter);
app.use('/applications', applicationRouter);
app.use('/company', companyRouter);
app.use('/review', reviewRouter);
app.use('/reviews', reviewRouter);
// /users — публичный список компаний-работодателей (для сайдбаров и формы отзыва)
app.get('/users', (_req, res, next) => {
  req.url = '/companies';
  next();
}, userRouter);
app.use('/users', userRouter);

// 404 в едином формате ошибок
app.use((_req, res) => res.status(404).json({ error: 'Маршрут не найден' }));

const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => console.log(`FindJob API запущен: http://localhost:${PORT}`));
