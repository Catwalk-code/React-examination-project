// Middleware авторизации (JWT) и проверки ролей.
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'findjob-secret-key';

// Проверяет заголовок Authorization: Bearer <token>
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    req.user = jwt.verify(token, JWT_SECRET); // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Недействительный или просроченный токен' });
  }
}

// Ограничивает маршрут списком ролей: authorize('admin', 'company')
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав для этого действия' });
    }
    next();
  };
}
