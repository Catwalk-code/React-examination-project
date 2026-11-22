import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../common/auth';
import { VacancyRepository } from './vacancy.repository';

@Injectable()
export class VacancyService {
  constructor(private repo: VacancyRepository) {}

  private format(v: any) {
    const from = Number(v.salaryFrom) || 0;
    return { ...v, salary: from > 0 ? from : null, companyId: v.company?.userId ?? v.companyId ?? null, companyName: v.company?.name };
  }

  async list() { return (await this.repo.findActive()).map((v: any) => this.format(v)); }
  async get(id: number) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Вакансия не найдена');
    return this.format(found);
  }
  async create(body: any, user: AuthUser) {
    const company = await this.repo.findCompanyByUserId(user.id);
    if (!company) throw new BadRequestException('Профиль компании не найден');
    if (!body.title || !body.description || !body.location) throw new BadRequestException('Заполните обязательные поля');
    const salary = Number(body.salary ?? body.salaryFrom) || 0;
    const salaryTo = Number(body.salaryTo) || 0;
    const created = await this.repo.create({ companyId: company.id, title: body.title, description: body.description, salaryFrom: salary, salaryTo: salaryTo > salary ? salaryTo : salary, location: body.location, isRemote: Boolean(body.isRemote) });
    return this.format(created);
  }
  async update(id: number, body: any, user: AuthUser) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Вакансия не найдена');
    if (user.role === 'company') {
      const company = await this.repo.findCompanyByUserId(user.id);
      if (!company || company.id !== found.companyId) throw new ForbiddenException('Можно изменять только свои вакансии');
    }
    const data: any = {};
    for (const key of ['title', 'description', 'location']) if (body[key] !== undefined) data[key] = body[key];
    if (body.salary !== undefined || body.salaryFrom !== undefined) {
      const salary = Number(body.salary ?? body.salaryFrom) || 0;
      data.salaryFrom = salary;
      data.salaryTo = Math.max(salary, Number(body.salaryTo) || 0);
    }
    if (body.isRemote !== undefined) data.isRemote = Boolean(body.isRemote);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    return this.repo.update(id, data);
  }
  async delete(id: number, user: AuthUser) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Вакансия не найдена');
    if (user.role === 'company') {
      const company = await this.repo.findCompanyByUserId(user.id);
      if (!company || company.id !== found.companyId) throw new ForbiddenException('Можно удалять только свои вакансии');
    }
    await this.repo.delete(id);
    return { ok: true };
  }
}
