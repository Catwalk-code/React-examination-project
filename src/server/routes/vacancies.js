// Вакансии: /vacancy/*
import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /vacancy/ — список активных вакансий (публичный)
router.get('/', async (_req, res) => {
  const vacancies = await prisma.vacancy.findMany({
    where: { isActive: true },
    include: { company: { select: { id: true, name: true, address: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(vacancies);
});

// GET /vacancy/:id — просмотр вакансии (публичный)
router.get('/:id', async (req, res) => {
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: Number(req.params.id) },
    include: { company: true },
  });
  if (!vacancy) return res.status(404).json({ error: 'Вакансия не найдена' });
  res.json(vacancy);
});

// POST /vacancy/ — создание вакансии (company)
router.post('/', authenticate, authorize('company'), async (req, res) => {
  const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
  if (!company) return res.status(400).json({ error: 'Профиль компании не найден' });
  const { title, description, salaryFrom, salaryTo, location, isRemote } = req.body || {};
  if (!title || !description || !location) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }
  const vacancy = await prisma.vacancy.create({
    data: {
      companyId: company.id,
      title,
      description,
      salaryFrom: Number(salaryFrom) || 0,
      salaryTo: Number(salaryTo) || 0,
      location,
      isRemote: Boolean(isRemote),
    },
  });
  res.status(201).json(vacancy);
});

// PUT /vacancy/:id — изменение вакансии (company-владелец или admin)
router.put('/:id', authenticate, authorize('company', 'admin'), async (req, res) => {
  const id = Number(req.params.id);
  const vacancy = await prisma.vacancy.findUnique({ where: { id } });
  if (!vacancy) return res.status(404).json({ error: 'Вакансия не найдена' });
  if (req.user.role === 'company') {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company || company.id !== vacancy.companyId) {
      return res.status(403).json({ error: 'Можно изменять только свои вакансии' });
    }
  }
  const updated = await prisma.vacancy.update({
    where: { id },
    data: {
      ...(['title', 'description', 'location'].reduce((acc, k) => {
        if (req.body[k] !== undefined) acc[k] = req.body[k];
        return acc;
      }, {})),
      ...(req.body.salaryFrom !== undefined ? { salaryFrom: Number(req.body.salaryFrom) } : {}),
      ...(req.body.salaryTo !== undefined ? { salaryTo: Number(req.body.salaryTo) } : {}),
      ...(req.body.isRemote !== undefined ? { isRemote: Boolean(req.body.isRemote) } : {}),
      ...(req.body.isActive !== undefined ? { isActive: Boolean(req.body.isActive) } : {}),
    },
  });
  res.json(updated);
});

// DELETE /vacancy/:id — удаление вакансии (company-владелец или admin)
router.delete('/:id', authenticate, authorize('company', 'admin'), async (req, res) => {
  const id = Number(req.params.id);
  const vacancy = await prisma.vacancy.findUnique({ where: { id } });
  if (!vacancy) return res.status(404).json({ error: 'Вакансия не найдена' });
  if (req.user.role === 'company') {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company || company.id !== vacancy.companyId) {
      return res.status(403).json({ error: 'Можно удалять только свои вакансии' });
    }
  }
  await prisma.vacancy.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
