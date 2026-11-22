import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyRepository {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.company.findMany({ include: { _count: { select: { vacancies: true, reviews: true } } }, orderBy: { name: 'asc' } }); }
  findById(id: number) { return this.prisma.company.findUnique({ where: { id }, include: { vacancies: { where: { isActive: true } } } }); }
  findPlainById(id: number) { return this.prisma.company.findUnique({ where: { id } }); }
  update(id: number, data: any) { return this.prisma.company.update({ where: { id }, data }); }
  delete(id: number) { return this.prisma.company.delete({ where: { id } }); }
}
