// Вакансии: /vacancy/* (+ алиасы /vacancies для фронтенда)
import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Приведение вакансии к формату фронтенда: одно числовое поле salary
// (null — «з/п не указана») и companyId = id пользователя-работодателя.
function toFrontendVacancy(v) {
  const salaryFrom = Number(v.salaryFrom) || 0;
  const salaryTo = Number(v.salaryTo) || 0;
  return {
    ...v,
    salary: salaryFrom > 0 ? salaryFrom : null,
    companyId: v.company?.userId ?? v.companyId ?? null,
    companyName: v.company?.name,
  };
}

// GET /vacancy/ — список активных вакансий (публичный)
router.get('/', async (_req, res) => {
  const vacancies = await prisma.vacancy.findMany({
    where: { isActive: true },
    include: { company: { select: { id: true, name: true, address: true, userId: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(vacancies.map(toFrontendVacancy));
});

// GET /vacancy/:id — просмотр вакансии (публичный)
router.get('/:id', async (req, res) => {
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: Number(req.params.id) },
    include: { company: true },
  });
  if (!vacancy) return res.status(404).json({ error: 'Вакансия не найдена' });
  res.json(toFrontendVacancy(vacancy));
});

// POST /vacancy/ — создание вакансии (company)
router.post('/', authenticate, authorize('company'), async (req, res) => {
  const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
  if (!company) return res.status(400).json({ error: 'Профиль компании не найден' });
  const { title, description, location, isRemote } = req.body || {};
  // фронтенд присылает одно поле salary; поддержим и salaryFrom/salaryTo
  const salary = Number(req.body.salary ?? req.body.salaryFrom) || 0;
  const salaryTo = Number(req.body.salaryTo) || 0;
  if (!title || !description || !location) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }
  const vacancy = await prisma.vacancy.create({
    data: {
      companyId: company.id,
      title,
      description,
      salaryFrom: salary,
      salaryTo: salaryTo > salary ? salaryTo : salary,
      location,
      isRemote: Boolean(isRemote),
    },
  });
  res.status(201).json(toFrontendVacancy(vacancy));
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
  const salary = Number(req.body.salary ?? req.body.salaryFrom) || 0;
  const updated = await prisma.vacancy.update({
    where: { id },
    data: {
      ...(['title', 'description', 'location'].reduce((acc, k) => {
        if (req.body[k] !== undefined) acc[k] = req.body[k];
        return acc;
      }, {})),
      ...(req.body.salary !== undefined || req.body.salaryFrom !== undefined
        ? { salaryFrom: salary, salaryTo: Math.max(salary, Number(req.body.salaryTo) || 0) }
        : {}),
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
