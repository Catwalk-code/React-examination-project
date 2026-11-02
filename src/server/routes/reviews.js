// Отзывы о компаниях: /review/* (+ алиасы для фронтенда)
import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const reviewRouter = Router();

// Формат фронтенда: authorId — id пользователя-автора, text — текст отзыва
async function toFrontend(review) {
  const applicant = review.seeker ?? (await prisma.applicant.findUnique({ where: { id: review.seekerId } }));
  return {
    id: review.id,
    companyId: review.companyId,
    authorId: applicant?.userId ?? null,
    userId: applicant?.userId ?? null,
    rating: review.rating,
    text: review.comment,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt ?? review.createdAt,
  };
}

// GET /review/ — все отзывы (публичный, для списка на главной)
reviewRouter.get('/', async (_req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { seeker: { select: { userId: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      reviews.map((r) => ({
        id: r.id,
        companyId: r.companyId,
        authorId: r.seeker?.userId ?? null,
        userId: r.seeker?.userId ?? null,
        rating: r.rating,
        text: r.comment,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt ?? r.createdAt,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /review/company/:companyId — отзывы о компании (публичный)
reviewRouter.get('/company/:companyId', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { companyId: Number(req.params.companyId) },
    include: { seeker: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reviews);
});

// POST /review/ — оставить отзыв (applicant)
// body: { companyId, rating, comment | text }
reviewRouter.post('/', authenticate, authorize('applicant'), async (req, res) => {
  try {
    const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
    if (!applicant) return res.status(404).json({ error: 'Профиль соискателя не найден' });
    const { companyId, rating } = req.body || {};
    const comment = req.body.comment ?? req.body.text;
    const company = await prisma.company.findUnique({ where: { id: Number(companyId) } });
    if (!company) return res.status(404).json({ error: 'Компания не найдена' });
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5 || !comment) {
      return res.status(400).json({ error: 'Оценка должна быть от 1 до 5, комментарий обязателен' });
    }
    const existing = await prisma.review.findUnique({
      where: { companyId_seekerId: { companyId: company.id, seekerId: applicant.id } },
    });
    if (existing) {
      // повторный отзыв — обновляем существующий (фронтенд поддерживает редактирование)
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating: r, comment },
        include: { seeker: { select: { userId: true } } },
      });
      return res.json(await toFrontend(updated));
    }
    const review = await prisma.review.create({
      data: { companyId: company.id, seekerId: applicant.id, rating: r, comment },
      include: { seeker: { select: { userId: true } } },
    });
    res.status(201).json(await toFrontend(review));
  } catch (e) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Вы уже оставляли отзыв об этой компании' });
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// PUT /review/:id — редактирование отзыва (автор или admin)
reviewRouter.put('/:id', authenticate, authorize('applicant', 'admin'), async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: Number(req.params.id) } });
    if (!review) return res.status(404).json({ error: 'Отзыв не найден' });
    const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
    if (req.user.role !== 'admin' && (!applicant || applicant.id !== review.seekerId)) {
      return res.status(403).json({ error: 'Можно изменять только свои отзывы' });
    }
    const data = {};
    if (req.body.rating !== undefined) {
      const r = Number(req.body.rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res.status(400).json({ error: 'Оценка должна быть от 1 до 5' });
      }
      data.rating = r;
    }
    const comment = req.body.comment ?? req.body.text;
    if (comment !== undefined) {
      if (!comment) return res.status(400).json({ error: 'Комментарий обязателен' });
      data.comment = comment;
    }
    const updated = await prisma.review.update({
      where: { id: review.id },
      data,
      include: { seeker: { select: { userId: true } } },
    });
    res.json(await toFrontend(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// DELETE /review/:id — удаление отзыва (автор или admin)
reviewRouter.delete('/:id', authenticate, authorize('applicant', 'admin'), async (req, res) => {
  try {
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
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});
