// Резюме: /resume/*
import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

async function getApplicant(req) {
  return prisma.applicant.findUnique({ where: { userId: req.user.id } });
}

// GET /resume/ — список резюме текущего соискателя (applicant)
router.get('/', authorize('applicant'), async (req, res) => {
  const applicant = await getApplicant(req);
  if (!applicant) return res.status(404).json({ error: 'Профиль соискателя не найден' });
  const resumes = await prisma.resume.findMany({
    where: { applicantId: applicant.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(resumes);
});

// GET /resume/:id — просмотр резюме (владелец, company или admin)
router.get('/:id', authorize('applicant', 'company', 'admin'), async (req, res) => {
  const resume = await prisma.resume.findUnique({
    where: { id: Number(req.params.id) },
    include: { applicant: { include: { user: { select: { email: true } } } } },
  });
  if (!resume) return res.status(404).json({ error: 'Резюме не найдено' });
  // Соискателю доступно только собственное резюме
  if (req.user.role === 'applicant') {
    const applicant = await getApplicant(req);
    if (!applicant || applicant.id !== resume.applicantId) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
  }
  res.json(resume);
});

// POST /resume/ — создание резюме (applicant)
router.post('/', authorize('applicant'), async (req, res) => {
  const applicant = await getApplicant(req);
  if (!applicant) return res.status(404).json({ error: 'Профиль соискателя не найден' });
  const { title, skills, experience, isPrimary } = req.body || {};
  if (!title || !skills || !experience) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }
  const resume = await prisma.resume.create({
    data: {
      applicantId: applicant.id,
      title,
      skills,
      experience,
      isPrimary: Boolean(isPrimary),
    },
  });
  res.status(201).json(resume);
});

// PUT /resume/:id — изменение резюме (только владелец)
router.put('/:id', authorize('applicant'), async (req, res) => {
  const applicant = await getApplicant(req);
  const resume = await prisma.resume.findUnique({ where: { id: Number(req.params.id) } });
  if (!resume) return res.status(404).json({ error: 'Резюме не найдено' });
  if (!applicant || applicant.id !== resume.applicantId) {
    return res.status(403).json({ error: 'Можно изменять только свои резюме' });
  }
  const updated = await prisma.resume.update({
    where: { id: resume.id },
    data: {
      ...(['title', 'skills', 'experience'].reduce((acc, k) => {
        if (req.body[k] !== undefined) acc[k] = req.body[k];
        return acc;
      }, {})),
      ...(req.body.isPrimary !== undefined ? { isPrimary: Boolean(req.body.isPrimary) } : {}),
    },
  });
  res.json(updated);
});

// DELETE /resume/:id — удаление резюме (владелец или admin)
router.delete('/:id', authorize('applicant', 'admin'), async (req, res) => {
  const resume = await prisma.resume.findUnique({ where: { id: Number(req.params.id) } });
  if (!resume) return res.status(404).json({ error: 'Резюме не найдено' });
  if (req.user.role === 'applicant') {
    const applicant = await getApplicant(req);
    if (!applicant || applicant.id !== resume.applicantId) {
      return res.status(403).json({ error: 'Можно удалять только свои резюме' });
    }
  }
  await prisma.resume.delete({ where: { id: resume.id } });
  res.json({ ok: true });
});

export default router;
