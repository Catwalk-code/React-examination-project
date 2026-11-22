// Компании: /company/*
// (отзывы о компаниях вынесены в routes/reviews.js — /review/*)
import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const companyRouter = Router();

// GET /company/ — список компаний (публичный)
companyRouter.get('/', async (_req, res) => {
  const companies = await prisma.company.findMany({
    include: { _count: { select: { vacancies: true, reviews: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(companies);
});

// GET /company/:id — информация о компании (публичный)
companyRouter.get('/:id', async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { id: Number(req.params.id) },
    include: { vacancies: { where: { isActive: true } } },
  });
  if (!company) return res.status(404).json({ error: 'Компания не найдена' });
  res.json(company);
});

// PUT /company/:id — изменение данных компании (владелец-company или admin)
companyRouter.put('/:id', authenticate, authorize('company', 'admin'), async (req, res) => {
  const id = Number(req.params.id);
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return res.status(404).json({ error: 'Компания не найдена' });
  if (req.user.role === 'company' && company.userId !== req.user.id) {
    return res.status(403).json({ error: 'Можно изменять только свою компанию' });
  }
  const updated = await prisma.company.update({
    where: { id },
    data: ['name', 'description', 'website', 'address'].reduce((acc, k) => {
      if (req.body[k] !== undefined) acc[k] = req.body[k];
      return acc;
    }, {}),
  });
  res.json(updated);
});

// DELETE /company/:id — удаление компании (admin)
companyRouter.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await prisma.company.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Компания не найдена' });
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

