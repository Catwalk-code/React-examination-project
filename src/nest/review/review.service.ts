import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../common/auth';
import { ReviewRepository } from './review.repository';

@Injectable()
export class ReviewService {
  constructor(private repo: ReviewRepository) {}
  async list() {
    const reviews = await this.repo.findAll();
    return reviews.map((r: any) => ({ id: r.id, companyId: r.companyId, authorId: r.seeker?.userId ?? null, userId: r.seeker?.userId ?? null, rating: r.rating, text: r.comment, comment: r.comment, createdAt: r.createdAt }));
  }
  findByCompany(companyId: number) { return this.repo.findByCompany(companyId); }
  async create(body: any, user: AuthUser) {
    const applicant = await this.repo.findApplicant(user.id);
    if (!applicant) throw new NotFoundException('Профиль соискателя не найден');
    const company = await this.repo.findCompany(Number(body.companyId));
    if (!company) throw new NotFoundException('Компания не найдена');
    const rating = Number(body.rating);
    const comment = body.comment ?? body.text;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) throw new BadRequestException('Оценка должна быть от 1 до 5, комментарий обязателен');
    if (await this.repo.findExisting(company.id, applicant.id)) throw new ConflictException('Вы уже оставляли отзыв об этой компании');
    try { return await this.repo.create({ companyId: company.id, seekerId: applicant.id, rating, comment }); }
    catch (e: any) { if (e.code === 'P2002') throw new ConflictException('Вы уже оставляли отзыв об этой компании'); throw e; }
  }
  async delete(id: number, user: AuthUser) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Отзыв не найден');
    if (user.role === 'applicant') {
      const applicant = await this.repo.findApplicant(user.id);
      if (!applicant || applicant.id !== found.seekerId) throw new ForbiddenException('Можно удалять только свои отзывы');
    }
    await this.repo.delete(id);
    return { ok: true };
  }
}
