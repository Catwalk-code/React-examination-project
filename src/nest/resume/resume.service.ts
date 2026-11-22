import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../common/auth';
import { ResumeRepository } from './resume.repository';

@Injectable()
export class ResumeService {
  constructor(private repo: ResumeRepository) {}
  async list() {
    const resumes = await this.repo.findPublic();
    return resumes.map((r: any) => ({ ...r, userId: r.applicant?.user?.id ?? null, name: `${r.applicant?.firstName || ''} ${r.applicant?.lastName || ''}`.trim() || r.applicant?.user?.name || 'Соискатель' }));
  }
  async my(user: AuthUser) {
    const applicant = await this.repo.findApplicant(user.id);
    if (!applicant) throw new NotFoundException('Профиль соискателя не найден');
    return this.repo.findManyByApplicant(applicant.id);
  }
  async get(id: number, user: AuthUser) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Резюме не найдено');
    if (user.role === 'applicant') {
      const applicant = await this.repo.findApplicant(user.id);
      if (!applicant || applicant.id !== found.applicantId) throw new ForbiddenException('Доступ запрещён');
    }
    return found;
  }
  async create(body: any, user: AuthUser) {
    const applicant = await this.repo.findApplicant(user.id);
    if (!applicant) throw new NotFoundException('Профиль соискателя не найден');
    const title = body.title || body.desiredPosition;
    const skills = body.skills || body.keySkills;
    const experience = body.experience || body.workExperience;
    if (!title || !skills || !experience) throw new BadRequestException('Заполните обязательные поля');
    return this.repo.create({ applicantId: applicant.id, title, skills, experience, isPrimary: Boolean(body.isPrimary ?? true) });
  }
  async update(id: number, body: any, user: AuthUser) {
    const applicant = await this.repo.findApplicant(user.id);
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Резюме не найдено');
    if (!applicant || applicant.id !== found.applicantId) throw new ForbiddenException('Можно изменять только свои резюме');
    const data: any = {};
    for (const key of ['title', 'skills', 'experience']) if (body[key] !== undefined) data[key] = body[key];
    if (body.isPrimary !== undefined) data.isPrimary = Boolean(body.isPrimary);
    return this.repo.update(id, data);
  }
  async delete(id: number, user: AuthUser) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Резюме не найдено');
    if (user.role === 'applicant') {
      const applicant = await this.repo.findApplicant(user.id);
      if (!applicant || applicant.id !== found.applicantId) throw new ForbiddenException('Можно удалять только свои резюме');
    }
    await this.repo.delete(id);
    return { ok: true };
  }
}
