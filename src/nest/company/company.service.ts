import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../common/auth';
import { CompanyRepository } from './company.repository';

@Injectable()
export class CompanyService {
  constructor(private repo: CompanyRepository) {}
  list() { return this.repo.findAll(); }
  async get(id: number) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Компания не найдена');
    return found;
  }
  async update(id: number, body: any, user: AuthUser) {
    const found = await this.repo.findPlainById(id);
    if (!found) throw new NotFoundException('Компания не найдена');
    if (user.role === 'company' && found.userId !== user.id) throw new ForbiddenException('Можно изменять только свою компанию');
    const data: any = {};
    for (const key of ['name', 'description', 'website', 'address']) if (body[key] !== undefined) data[key] = body[key];
    return this.repo.update(id, data);
  }
  async delete(id: number) {
    try { await this.repo.delete(id); return { ok: true }; }
    catch (e: any) { if (e.code === 'P2025') throw new NotFoundException('Компания не найдена'); throw e; }
  }
}
