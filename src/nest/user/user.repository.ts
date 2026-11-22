import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}
  findProfile(id: number) {
    return this.prisma.user.findUnique({ where: { id }, include: { company: true, applicant: { include: { resumes: true } } } });
  }
  findMany() {
    return this.prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
  }
  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id }, include: { company: true, applicant: true } });
  }
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  create(data: any) { return this.prisma.user.create({ data }); }
  update(id: number, data: any) { return this.prisma.user.update({ where: { id }, data }); }
  delete(id: number) { return this.prisma.user.delete({ where: { id } }); }
  findCompanies() { return this.prisma.company.findMany({ include: { user: { select: { id: true, email: true } } }, orderBy: { name: 'asc' } }); }
  findApplicantProfile(userId: number) { return this.prisma.applicant.findUnique({ where: { userId } }); }
  createApplicantProfile(data: any) { return this.prisma.applicant.create({ data }); }
}
