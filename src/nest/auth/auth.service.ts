import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { JWT_SECRET } from '../common/auth';
import { EmailProducer } from '../email/email.producer';

@Injectable()
export class AuthService {
  constructor(private repo: AuthRepository, private emailProducer: EmailProducer) {}

  private token(user: any) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  }

  async register(body: any) {
    const { email, password, name, firstName, lastName, phone, companyName } = body || {};
    const role = body?.role === 'seeker' ? 'applicant' : body?.role;
    if (!email || !password || !['applicant', 'company'].includes(role)) {
      throw new BadRequestException('Некорректные данные регистрации');
    }
    if (await this.repo.findByEmail(email)) throw new ConflictException('Email уже занят');

    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    const fName = firstName || parts[0] || '';
    const lName = lastName || parts.slice(1).join(' ') || '';
    const user = await this.repo.create({
      email,
      name: name || companyName || null,
      passhash: bcrypt.hashSync(password, 10),
      role,
      ...(role === 'company'
        ? { company: { create: { name: companyName || name || email, address: 'не указан' } } }
        : { applicant: { create: { firstName: fName, lastName: lName, phone: phone || '' } } }),
    });
    const { passhash, ...safeUser } = user as any;
    await this.emailProducer.publishRegistrationEmail({
      to: user.email,
      name: name || companyName || '',
      role,
      userId: user.id,
      registeredAt: new Date().toISOString(),
    });
    return { token: this.token(user), user: safeUser };
  }

  async login(body: any) {
    const user = await this.repo.findByEmail(body?.email);
    if (!user || !bcrypt.compareSync(body?.password || '', (user as any).passhash)) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const applicant = (user as any).applicant;
    const applicantName = `${applicant?.firstName || ''} ${applicant?.lastName || ''}`.trim();
    return {
      token: this.token(user),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || applicantName || (user as any).company?.name || undefined,
      },
    };
  }
}
