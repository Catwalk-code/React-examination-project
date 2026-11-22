// Единая коллекция «applications» для фронтенда: /applications/*
// Сервер хранит отклики на вакансии (Response) и приглашения компаний (Invite)
// раздельно; фронтенд работает с одной коллекцией с полем type
// ('vacancy_application' | 'resume_invite'). Здесь выполняется адаптация.
import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function responseToFrontend(r) {
  return {
    id: r.id,
    type: 'vacancy_application',
    status: r.status,
    vacancyId: r.vacancyId,
    resumeId: r.resumeId,
    seekerId: r.applicant?.user?.id ?? null,
    companyId: r.vacancy?.company?.userId ?? null,
    createdAt: r.createdAt,
  };
}

function inviteToFrontend(i) {
  return {
    id: i.id,
    type: 'resume_invite',
    status: i.status,
    vacancyId: null,
    resumeId: i.resumeId,
    seekerId: i.inviteeUserId,
    companyId: i.company?.userId ?? null,
    createdAt: i.createdAt,
  };
}

async function listForUser(req) {
  if (req.user.role === 'company') {
    const [responses, invites] = await Promise.all([
      prisma.response.findMany({
        where: { vacancy: { company: { userId: req.user.id } } },
        include: { applicant: { select: { user: { select: { id: true } } } }, vacancy: { select: { company: { select: { userId: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invite.findMany({
        where: { companyId: (await prisma.company.findUnique({ where: { userId: req.user.id } }))?.id ?? -1 },
        include: { company: { select: { userId: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return [...responses.map(responseToFrontend), ...invites.map(inviteToFrontend)]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (req.user.role === 'applicant') {
    const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
    if (!applicant) return [];
    const [responses, invites] = await Promise.all([
      prisma.response.findMany({
        where: { applicantId: applicant.id },
        include: { applicant: { select: { user: { select: { id: true } } } }, vacancy: { select: { company: { select: { userId: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invite.findMany({
        where: { inviteeUserId: req.user.id },
        include: { company: { select: { userId: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return [...responses.map(responseToFrontend), ...invites.map(inviteToFrontend)]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // admin — всё
  const [responses, invites] = await Promise.all([
    prisma.response.findMany({
      include: { applicant: { select: { user: { select: { id: true } } } }, vacancy: { select: { company: { select: { userId: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invite.findMany({ include: { company: { select: { userId: true } } }, orderBy: { createdAt: 'desc' } }),
  ]);
  return [...responses.map(responseToFrontend), ...invites.map(inviteToFrontend)];
}

// GET /applications — все отклики/приглашения, видимые текущему пользователю
router.get('/', async (req, res) => {
  try {
    res.json(await listForUser(req));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /applications — отклик (applicant) или приглашение (company)
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const type = body.type === 'resume_invite' ? 'resume_invite' : 'vacancy_application';

    if (type === 'vacancy_application') {
      if (req.user.role !== 'applicant') {
        return res.status(403).json({ error: 'Откликаться могут только соискатели' });
      }
      const applicant = await prisma.applicant.findUnique({ where: { userId: req.user.id } });
      if (!applicant) return res.status(400).json({ error: 'Профиль соискателя не найден' });
      const vacancy = await prisma.vacancy.findUnique({ where: { id: Number(body.vacancyId) } });
      if (!vacancy) return res.status(404).json({ error: 'Вакансия не найдена' });
      const already = await prisma.response.findUnique({
        where: { vacancyId_applicantId: { vacancyId: vacancy.id, applicantId: applicant.id } },
      });
      if (already) return res.status(409).json({ error: 'Вы уже откликались на эту вакансию' });
      const created = await prisma.response.create({
        data: {
          vacancyId: vacancy.id,
          applicantId: applicant.id,
          resumeId: body.resumeId ? Number(body.resumeId) : null,
          status: 'new',
        },
      });
      // отклик требует резюме — если его не передали, берём основной
      if (!created.resumeId) {
        const primary = await prisma.resume.findFirst({ where: { applicantId: applicant.id } });
        if (primary) {
          created.resumeId = primary.id;
          await prisma.response.update({ where: { id: created.id }, data: { resumeId: primary.id } });
        }
      }
      return res.status(201).json(responseToFrontend({
        ...created,
        applicant: { user: { id: req.user.id } },
        vacancy: { company: { userId: (await prisma.company.findUnique({ where: { id: vacancy.companyId } }))?.userId ?? null } },
      }));
    }

    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Приглашать могут только компании' });
    }
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(400).json({ error: 'Профиль компании не найден' });
    const resume = await prisma.resume.findUnique({ where: { id: Number(body.resumeId) } });
    if (!resume) return res.status(404).json({ error: 'Резюме не найдено' });
    const already = await prisma.invite.findUnique({
      where: { companyId_resumeId: { companyId: company.id, resumeId: resume.id } },
    });
    if (already) return res.status(409).json({ error: 'Вы уже приглашали этого кандидата' });
    const applicant = await prisma.applicant.findUnique({ where: { id: resume.applicantId } });
    const invite = await prisma.invite.create({
      data: {
        companyId: company.id,
        resumeId: resume.id,
        inviteeUserId: applicant.userId,
        status: 'interview',
      },
      include: { company: { select: { userId: true } } },
    });
    res.status(201).json(inviteToFrontend(invite));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// PUT /applications/:id — обновление записи (статус и т.п.)
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type, status } = req.body || {};
    if (type === 'resume_invite') {
      const invite = await prisma.invite.findUnique({ where: { id }, include: { company: { select: { userId: true } } } });
      if (!invite) return res.status(404).json({ error: 'Приглашение не найдено' });
      if (req.user.role !== 'admin' && invite.company.userId !== req.user.id) {
        return res.status(403).json({ error: 'Недостаточно прав' });
      }
      const updated = await prisma.invite.update({
        where: { id },
        data: typeof status === 'string' ? { status } : {},
        include: { company: { select: { userId: true } } },
      });
      return res.json(inviteToFrontend(updated));
    }
    const response = await prisma.response.findUnique({
      where: { id },
      include: {
        applicant: { select: { user: { select: { id: true } } } },
        vacancy: { select: { company: { select: { userId: true } } } },
      },
    });
    if (!response) return res.status(404).json({ error: 'Отклик не найден' });
    const allowed =
      req.user.role === 'admin' ||
      response.vacancy?.company?.userId === req.user.id ||
      response.applicant?.user?.id === req.user.id;
    if (!allowed) return res.status(403).json({ error: 'Недостаточно прав' });
    const updated = await prisma.response.update({
      where: { id },
      data: typeof status === 'string' ? { status } : {},
      include: {
        applicant: { select: { user: { select: { id: true } } } },
        vacancy: { select: { company: { select: { userId: true } } } },
      },
    });
    res.json(responseToFrontend(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// DELETE /applications/:id — удаление своей записи
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type } = req.body || {};
    const qsType = new URL(req.url, 'http://x').searchParams.get('type');
    const kind = type || qsType;

    if (kind === 'resume_invite') {
      const invite = await prisma.invite.findUnique({ where: { id }, include: { company: { select: { userId: true } } } });
      if (!invite) return res.status(404).json({ error: 'Приглашение не найдено' });
      if (req.user.role !== 'admin' && invite.company.userId !== req.user.id) {
        return res.status(403).json({ error: 'Недостаточно прав' });
      }
      await prisma.invite.delete({ where: { id } });
      return res.json({ ok: true });
    }

    const response = await prisma.response.findUnique({
      where: { id },
      include: {
        applicant: { select: { user: { select: { id: true } } } },
        vacancy: { select: { company: { select: { userId: true } } } },
      },
    });
    if (!response) return res.status(404).json({ error: 'Отклик не найден' });
    const allowed =
      req.user.role === 'admin' ||
      response.vacancy?.company?.userId === req.user.id ||
      response.applicant?.user?.id === req.user.id;
    if (!allowed) return res.status(403).json({ error: 'Недостаточно прав' });
    await prisma.response.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
