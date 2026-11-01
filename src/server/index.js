// Точка входа REST API проекта FindJob (порт 4000).
// Все данные читаются/пишутся через Prisma Client (Prisma 7 + адаптер pg).
import express from 'express';
import 'dotenv/config';

import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';
import vacancyRouter from './routes/vacancies.js';
import resumeRouter from './routes/resumes.js';
import responseRouter from './routes/responses.js';
import { companyRouter, reviewRouter } from './routes/companies.js';
import { prisma } from './db.js';

const app = express();
app.use(express.json());

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
app.use('/resume', resumeRouter);
app.use('/response', responseRouter);
app.use('/company', companyRouter);
app.use('/review', reviewRouter);

const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => console.log(`FindJob API запущен: http://localhost:${PORT}`));
