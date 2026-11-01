// Компании и отзывы о них: /company/*, /review/*
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

// ---- Отзывы о компаниях ----
export const reviewRouter = Router();

// GET /review/company/:companyId — отзывы о компании (публичный)
reviewRouter.get('/company/:companyId', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { companyId: Number(req.params.companyId) },
    include: { seeker: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reviews);
});

// POST /review/ — оставить отзыв о компании (applicant)
// body: { companyId, rating, comment }
reviewRouter.post('/', authenticate, authorize('applicant'), async (req, res) => {
  const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
  if (!applicant) return res.status(404).json({ error: 'Профиль соискателя не найден' });
  const { companyId, rating, comment } = req.body || {};
  const company = await prisma.company.findUnique({ where: { id: Number(companyId) } });
  if (!company) return res.status(404).json({ error: 'Компания не найдена' });
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5 || !comment) {
    return res.status(400).json({ error: 'Оценка должна быть от 1 до 5, комментарий обязателен' });
  }
  try {
    const review = await prisma.review.create({
      data: { companyId: company.id, seekerId: applicant.id, rating: r, comment },
    });
    res.status(201).json(review);
  } catch (e) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Вы уже оставляли отзыв об этой компании' });
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// DELETE /review/:id — удаление отзыва (автор или admin)
reviewRouter.delete('/:id', authenticate, authorize('applicant', 'admin'), async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: Number(req.params.id) } });
  if (!review) return res.status(404).json({ error: 'Отзыв не найден' });
  if (req.user.role === 'applicant') {
    const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
    if (!applicant || applicant.id !== review.seekerId) {
      return res.status(403).json({ error: 'Можно удалять только свои отзывы' });
    }
  }
  await prisma.review.delete({ where: { id: review.id } });
  res.json({ ok: true });
});
