import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResponseRepository {
  constructor(private prisma: PrismaService) {}
  findApplicant(userId: number) { return this.prisma.applicant.findUnique({ where: { userId } }); }
  findVacancy(id: number) { return this.prisma.vacancy.findUnique({ where: { id } }); }
  findResume(id: number) { return this.prisma.resume.findUnique({ where: { id } }); }
  findExisting(vacancyId: number, applicantId: number) { return this.prisma.response.findUnique({ where: { vacancyId_applicantId: { vacancyId, applicantId } } }); }
  create(data: any) { return this.prisma.response.create({ data }); }
  findMy(applicantId: number) { return this.prisma.response.findMany({ where: { applicantId }, include: { vacancy: { include: { company: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' } }); }
  findForCompany(userId: number, role: string) {
    return this.prisma.response.findMany({ where: role === 'company' ? { vacancy: { company: { userId } } } : {}, include: { vacancy: { select: { id: true, title: true } }, applicant: { select: { firstName: true, lastName: true } }, resume: { select: { id: true, title: true } } }, orderBy: { createdAt: 'desc' } });
  }
  findById(id: number) { return this.prisma.response.findUnique({ where: { id }, include: { vacancy: { include: { company: true } } } }); }
  findCompanyByUserId(userId: number) { return this.prisma.company.findUnique({ where: { userId } }); }
  update(id: number, status: string) { return this.prisma.response.update({ where: { id }, data: { status: status as any } }); }
  delete(id: number) { return this.prisma.response.delete({ where: { id } }); }
}
