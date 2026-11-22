import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewRepository {
  constructor(private prisma: PrismaService) {}
  findApplicant(userId: number) { return this.prisma.applicant.findUnique({ where: { userId } }); }
  findCompany(id: number) { return this.prisma.company.findUnique({ where: { id } }); }
  findExisting(companyId: number, seekerId: number) { return this.prisma.review.findUnique({ where: { companyId_seekerId: { companyId, seekerId } } }); }
  findById(id: number) { return this.prisma.review.findUnique({ where: { id } }); }
  findByCompany(companyId: number) { return this.prisma.review.findMany({ where: { companyId }, include: { seeker: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } }); }
  create(data: any) { return this.prisma.review.create({ data }); }
  delete(id: number) { return this.prisma.review.delete({ where: { id } }); }
  findAll() { return this.prisma.review.findMany({ include: { seeker: { select: { userId: true } } }, orderBy: { createdAt: 'desc' } }); }
}
