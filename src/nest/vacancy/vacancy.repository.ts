import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VacancyRepository {
  constructor(private prisma: PrismaService) {}
  findActive() {
    return this.prisma.vacancy.findMany({ where: { isActive: true }, include: { company: { select: { id: true, name: true, address: true, userId: true } } }, orderBy: { createdAt: 'desc' } });
  }
  findById(id: number) { return this.prisma.vacancy.findUnique({ where: { id }, include: { company: true } }); }
  findCompanyByUserId(userId: number) { return this.prisma.company.findUnique({ where: { userId } }); }
  create(data: any) { return this.prisma.vacancy.create({ data }); }
  update(id: number, data: any) { return this.prisma.vacancy.update({ where: { id }, data }); }
  delete(id: number) { return this.prisma.vacancy.delete({ where: { id } }); }
}
