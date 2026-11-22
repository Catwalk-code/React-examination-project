import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthUser } from '../common/auth';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}

  private safe(user: any) { if (!user) return user; const { passhash, ...safe } = user; return safe; }

  async profile(user: AuthUser) {
    const found = await this.repo.findProfile(user.id);
    if (!found) throw new NotFoundException('Пользователь не найден');
    return this.safe(found);
  }

  async companies() {
    const companies = await this.repo.findCompanies();
    return companies.map((c: any) => ({ id: c.userId, companyId: c.id, name: c.name, email: c.user.email, role: 'company' }));
  }

  async list() { return this.repo.findMany(); }

  async get(id: number) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Пользователь не найден');
    return this.safe(found);
  }

  async create(body: any) {
    const { email, password, role } = body || {};
    if (!email || !password || !['applicant', 'company', 'admin'].includes(role)) throw new BadRequestException('Некорректные данные');
    if (await this.repo.findByEmail(email)) throw new ConflictException('Email уже занят');
    return this.safe(await this.repo.create({ email, passhash: bcrypt.hashSync(password, 10), role }));
  }

  async update(id: number, body: any, current: AuthUser) {
    if (current.role !== 'admin' && current.id !== id) throw new ForbiddenException('Можно изменять только свой профиль');
    const data: any = {};
    if (body.email) data.email = body.email;
    if (body.password) data.passhash = bcrypt.hashSync(body.password, 10);
    if (body.role && current.role === 'admin') data.role = body.role;
    try { return this.safe(await this.repo.update(id, data)); }
    catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Пользователь не найден');
      if (e.code === 'P2002') throw new ConflictException('Email уже занят');
      throw e;
    }
  }

  async delete(id: number) {
    try { await this.repo.delete(id); return { ok: true }; }
    catch (e: any) { if (e.code === 'P2025') throw new NotFoundException('Пользователь не найден'); throw e; }
  }

  async createApplicantProfile(current: AuthUser, body: any) {
    const existing = await this.repo.findApplicantProfile(current.id);
    if (existing) return existing;
    const parts = String(body?.name || '').trim().split(/\s+/).filter(Boolean);
    return this.repo.createApplicantProfile({
      userId: current.id,
      firstName: body?.firstName || parts[0] || '',
      lastName: body?.lastName || parts.slice(1).join(' ') || '',
      phone: body?.phone || '',
    });
  }
}
