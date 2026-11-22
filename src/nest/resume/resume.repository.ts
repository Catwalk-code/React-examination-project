import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumeRepository {
  constructor(private prisma: PrismaService) {}
  findApplicant(userId: number) { return this.prisma.applicant.findUnique({ where: { userId } }); }
  findPublic() { return this.prisma.resume.findMany({ include: { applicant: { select: { id: true, firstName: true, lastName: true, user: { select: { id: true, email: true, name: true } } } } }, orderBy: { createdAt: 'desc' } }); }
  findManyByApplicant(applicantId: number) { return this.prisma.resume.findMany({ where: { applicantId }, orderBy: { createdAt: 'desc' } }); }
  findById(id: number) { return this.prisma.resume.findUnique({ where: { id }, include: { applicant: { include: { user: { select: { email: true } } } } } }); }
  create(data: any) { return this.prisma.resume.create({ data }); }
  update(id: number, data: any) { return this.prisma.resume.update({ where: { id }, data }); }
  delete(id: number) { return this.prisma.resume.delete({ where: { id } }); }
}
