// Отклики на вакансии: /response/*
import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// POST /response/ — отклик на вакансию (applicant)
// body: { vacancyId, resumeId, coverLetter? }
router.post('/', authorize('applicant'), async (req, res) => {
  const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
  if (!applicant) return res.status(404).json({ error: 'Профиль соискателя не найден' });
  const { vacancyId, resumeId, coverLetter } = req.body || {};
  const [vacancy, resume] = await Promise.all([
    prisma.vacancy.findUnique({ where: { id: Number(vacancyId) } }),
    prisma.resume.findUnique({ where: { id: Number(resumeId) } }),
  ]);
  if (!vacancy || !vacancy.isActive) return res.status(404).json({ error: 'Вакансия недоступна' });
  if (!resume || resume.applicantId !== applicant.id) {
    return res.status(400).json({ error: 'Указано чужое или несуществующее резюме' });
  }
  try {
    const response = await prisma.response.create({
      data: {
        vacancyId: vacancy.id,
        applicantId: applicant.id,
        resumeId: resume.id,
        coverLetter: coverLetter || null,
      },
    });
    res.status(201).json(response);
  } catch (e) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Вы уже откликались на эту вакансию' });
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /response/my/ — мои отклики (applicant)
router.get('/my', authorize('applicant'), async (req, res) => {
  const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
  if (!applicant) return res.status(404).json({ error: 'Профиль соискателя не найден' });
  const responses = await prisma.response.findMany({
    where: { applicantId: applicant.id },
    include: { vacancy: { include: { company: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(responses);
});

// GET /response/ — отклики на вакансии компании-работодателя (company, admin)
router.get('/', authorize('company', 'admin'), async (req, res) => {
  const where =
    req.user.role === 'company'
      ? { vacancy: { company: { userId: req.user.id } } }
      : {};
  const responses = await prisma.response.findMany({
    where,
    include: {
      vacancy: { select: { id: true, title: true } },
      applicant: { select: { firstName: true, lastName: true } },
      resume: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(responses);
});

// PUT /response/:id — смена статуса отклика (company-владелец вакансии или applicant-автор)
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const response = await prisma.response.findUnique({
    where: { id },
    include: { vacancy: { include: { company: true } } },
  });
  if (!response) return res.status(404).json({ error: 'Отклик не найден' });

  let data = null;
  if (req.user.role === 'company') {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company || company.id !== response.vacancy.companyId) {
      return res.status(403).json({ error: 'Можно управлять только откликами на свои вакансии' });
    }
    if (!['viewed', 'interview', 'rejected', 'hired'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }
    data = { status: req.body.status };
  } else if (req.user.role === 'applicant') {
    const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
    if (!applicant || applicant.id !== response.applicantId) {
      return res.status(403).json({ error: 'Можно отзывать только свои отклики' });
    }
    if (req.body.status !== 'withdrawn') {
      return res.status(400).json({ error: 'Соискатель может только отозвать отклик' });
    }
    data = { status: 'withdrawn' };
  } else {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }
  const updated = await prisma.response.update({ where: { id }, data });
  res.json(updated);
});

// DELETE /response/:id — удаление отклика (admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await prisma.response.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Отклик не найден' });
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
