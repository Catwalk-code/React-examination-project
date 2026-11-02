// Управление пользователями: /user/* (+ алиасы для фронтенда)
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Публичный список компаний (работодателей) в формате фронтенда:
// { id, name, role: 'company' } — используется для сайдбара и формы отзыва.
router.get('/companies', async (_req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { user: { select: { id: true, email: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(
      companies.map((c) => ({
        id: c.userId,          // фронтенд связывает данные по id пользователя
        companyId: c.id,
        name: c.name,
        email: c.user.email,
        role: 'company',
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /user/profile — профиль текущего пользователя (applicant, company, admin)
router.get('/profile', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { company: true, applicant: { include: { resumes: true } } },
  });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  delete user.passhash;
  res.json(user);
});

// POST /user/applicant-profile — создать профиль соискателя для текущего
// пользователя (нужен аккаунтам, созданным до миграции на Prisma: у них есть
// роль applicant, но нет записи в таблице applicants, из-за чего невозможно
// создать резюме или откликнуться на вакансию).
router.post('/applicant-profile', authenticate, authorize('applicant'), async (req, res) => {
  try {
    const existing = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
    if (existing) return res.json(existing);

    const parts = String(req.body?.name || '').trim().split(/\s+/).filter(Boolean);
    const applicant = await prisma.applicant.create({
      data: {
        userId: req.user.id,
        firstName: req.body?.firstName || parts[0] || '',
        lastName: req.body?.lastName || parts.slice(1).join(' ') || '',
        phone: req.body?.phone || '',
      },
    });
    res.status(201).json(applicant);
  } catch (e) {
    if (e?.code === 'P2002') return res.json({ ok: true }); // гонка — профиль уже создан
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /user/ — список всех пользователей (admin)
router.get('/', authorize('admin'), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
  });
  res.json(users);
});

// GET /user/:id — просмотр конкретного пользователя (admin)
router.get('/:id', authorize('admin'), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: { company: true, applicant: true },
  });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  delete user.passhash;
  res.json(user);
});

// POST /user/ — добавление пользователя (admin)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password || !['applicant', 'company', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email уже занят' });
    const user = await prisma.user.create({
      data: { email, passhash: bcrypt.hashSync(password, 10), role },
    });
    delete user.passhash;
    res.status(201).json(user);
  } catch (e) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Email уже занят' });
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// PUT /user/:id — изменение пользователя (admin или сам пользователь)
router.put('/:id', authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && req.user.id !== id) {
    return res.status(403).json({ error: 'Можно изменять только свой профиль' });
  }
  const { email, password, role } = req.body || {};
  const data = {};
  if (email) data.email = email;
  if (password) data.passhash = bcrypt.hashSync(password, 10);
  if (role && isAdmin) data.role = role; // смену роли может только админ
  try {
    const user = await prisma.user.update({ where: { id }, data });
    delete user.passhash;
    res.json(user);
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Пользователь не найден' });
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Email уже занят' });
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// DELETE /user/:id — удаление пользователя (admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Пользователь не найден' });
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
