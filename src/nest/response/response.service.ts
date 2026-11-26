import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../common/auth';
import { ResponseRepository } from './response.repository';

@Injectable()
export class ResponseService {
  constructor(private repo: ResponseRepository) {}
  async create(body: any, user: AuthUser) {
    const applicant = await this.repo.findApplicant(user.id);
    if (!applicant) throw new NotFoundException('Профиль соискателя не найден');
    if (!body.vacancyId) throw new BadRequestException('Укажите вакансию');
    const vacancy = await this.repo.findVacancy(Number(body.vacancyId));
    const resume = await this.repo.findResume(Number(body.resumeId));
    if (!vacancy || !vacancy.isActive) throw new NotFoundException('Вакансия недоступна');
    if (!resume || resume.applicantId !== applicant.id) throw new BadRequestException('Указано чужое или несуществующее резюме');
    if (await this.repo.findExisting(vacancy.id, applicant.id)) throw new ConflictException('Вы уже откликались на эту вакансию');
    try { return await this.repo.create({ vacancyId: vacancy.id, applicantId: applicant.id, resumeId: resume.id, coverLetter: body.coverLetter || null }); }
    catch (e: any) { if (e.code === 'P2002') throw new ConflictException('Вы уже откликались на эту вакансию'); throw e; }
  }
  async invite(body: any, user: AuthUser) {
    if (user.role !== 'company') throw new ForbiddenException('Приглашать могут только компании');
    const company = await this.repo.findCompanyByUserId(user.id);
    if (!company) throw new NotFoundException('Профиль компании не найден');
    if (!body.resumeId) throw new BadRequestException('Укажите резюме');
    const resume = await this.repo.findResumeWithApplicant(Number(body.resumeId));
    if (!resume) throw new NotFoundException('Резюме не найдено');
    if (await this.repo.findExistingInvite(company.id, resume.id)) {
      throw new ConflictException('Вы уже приглашали этого кандидата');
    }
    try {
      const invite = await this.repo.createInvite({
        companyId: company.id,
        resumeId: resume.id,
        inviteeUserId: resume.applicant.userId,
        status: 'interview',
      });
      return {
        id: invite.id,
        type: 'resume_invite',
        status: invite.status,
        vacancyId: null,
        resumeId: invite.resumeId,
        seekerId: invite.inviteeUserId,
        companyId: invite.company?.userId ?? null,
        createdAt: invite.createdAt,
      };
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Вы уже приглашали этого кандидата');
      throw e;
    }
  }
  async my(user: AuthUser) {
    const applicant = await this.repo.findApplicant(user.id);
    if (!applicant) throw new NotFoundException('Профиль соискателя не найден');
    return this.repo.findMy(applicant.id);
  }
  async list(user: AuthUser) {
    const [responses, invites] = await this.repo.findApplications(user.id, user.role);
    const responseItems = responses.map((response: any) => ({
      id: response.id,
      type: 'vacancy_application',
      status: response.status,
      vacancyId: response.vacancyId,
      resumeId: response.resumeId,
      seekerId: response.applicant?.user?.id ?? null,
      companyId: response.vacancy?.company?.userId ?? null,
      createdAt: response.createdAt,
    }));
    const inviteItems = invites.map((invite: any) => ({
      id: invite.id,
      type: 'resume_invite',
      status: invite.status,
      vacancyId: null,
      resumeId: invite.resumeId,
      seekerId: invite.inviteeUserId,
      companyId: invite.company?.userId ?? null,
      createdAt: invite.createdAt,
    }));
    return [...responseItems, ...inviteItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async update(id: number, body: any, user: AuthUser) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Отклик не найден');
    if (user.role === 'company') {
      const company = await this.repo.findCompanyByUserId(user.id);
      if (!company || company.id !== found.vacancy.companyId) throw new ForbiddenException('Можно управлять только откликами на свои вакансии');
      if (!['viewed', 'interview', 'rejected', 'hired'].includes(body.status)) throw new BadRequestException('Недопустимый статус');
      return this.repo.update(id, body.status);
    }
    if (user.role === 'applicant') {
      const applicant = await this.repo.findApplicant(user.id);
      if (!applicant || applicant.id !== found.applicantId) throw new ForbiddenException('Можно отзывать только свои отклики');
      if (body.status !== 'withdrawn') throw new BadRequestException('Соискатель может только отозвать отклик');
      return this.repo.update(id, 'withdrawn');
    }
    throw new ForbiddenException('Недостаточно прав');
  }
  async delete(id: number) {
    try { await this.repo.delete(id); return { ok: true }; }
    catch (e: any) { if (e.code === 'P2025') throw new NotFoundException('Отклик не найден'); throw e; }
  }
}
