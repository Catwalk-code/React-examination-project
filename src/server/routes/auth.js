// Маршруты аутентификации: /auth/register, /auth/login
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// POST /auth/register — регистрация (публичный)
// body: { email, password, role, name?, firstName?, lastName?, phone?, companyName? }
// Фронтенд отправляет role: 'seeker' | 'company' и одно поле name;
// поддерживаем и «старые» значения ('applicant'), и раздельные firstName/lastName.
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, firstName, lastName, phone, companyName } = req.body || {};
    const rawRole = req.body?.role;
    const role = rawRole === 'seeker' ? 'applicant' : rawRole; // seeker → applicant
    if (!email || !password || !['applicant', 'company'].includes(role)) {
      return res.status(400).json({ error: 'Некорректные данные регистрации' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email уже занят' });

    // Разбиваем ФИО соискателя на имя/фамилию для профиля Applicant
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    const fName = firstName || parts[0] || '';
    const lName = lastName || parts.slice(1).join(' ') || '';

    const user = await prisma.user.create({
      data: {
        email,
        name: name || companyName || null,
        passhash: bcrypt.hashSync(password, 10),
        role,
        ...(role === 'company'
          ? { company: { create: { name: companyName || name || email, address: 'не указан' } } }
          : {
              applicant: {
                create: {
                  firstName: fName,
                  lastName: lName,
                  phone: phone || '',
                },
              },
            }),
      },
      include: { company: true, applicant: true },
    });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '8h',
    });
    res.status(201).json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /auth/login — вход (публичный)
// body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password || '', user.passhash)) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '8h',
    });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
