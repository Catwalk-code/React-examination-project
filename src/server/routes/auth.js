// Маршруты аутентификации: /auth/register, /auth/login
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// POST /auth/register — регистрация (публичный)
// body: { email, password, role: 'applicant'|'company', firstName?, lastName?, phone?, companyName? }
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, companyName } = req.body || {};
    if (!email || !password || !['applicant', 'company'].includes(role)) {
      return res.status(400).json({ error: 'Некорректные данные регистрации' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email уже занят' });

    const user = await prisma.user.create({
      data: {
        email,
        passhash: bcrypt.hashSync(password, 10),
        role,
        ...(role === 'company'
          ? { company: { create: { name: companyName || email, address: 'не указан' } } }
          : {
              applicant: {
                create: {
                  firstName: firstName || '',
                  lastName: lastName || '',
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
