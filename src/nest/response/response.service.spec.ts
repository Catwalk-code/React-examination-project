import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResponseService } from './response.service';

describe('ResponseService', () => {
  const repository = {
    findApplicant: vi.fn(),
    findVacancy: vi.fn(),
    findResume: vi.fn(),
    findResumeWithApplicant: vi.fn(),
    findExisting: vi.fn(),
    findExistingInvite: vi.fn(),
    create: vi.fn(),
    createInvite: vi.fn(),
    findCompanyByUserId: vi.fn(),
    findMy: vi.fn(),
    findApplications: vi.fn(),
  };
  let service: ResponseService;
  const applicantUser = { id: 10, email: 'user@example.com', role: 'applicant' as const };
  const companyUser = { id: 11, email: 'company@example.com', role: 'company' as const };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ResponseService(repository as never);
  });

  it('creates a response for an active vacancy using the applicant-owned resume', async () => {
    repository.findApplicant.mockResolvedValue({ id: 20, userId: applicantUser.id });
    repository.findVacancy.mockResolvedValue({ id: 30, isActive: true });
    repository.findResume.mockResolvedValue({ id: 40, applicantId: 20 });
    repository.findExisting.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: 50, status: 'pending' });

    await expect(service.create(
      { vacancyId: 30, resumeId: 40, coverLetter: 'I am interested' },
      applicantUser,
    )).resolves.toEqual({ id: 50, status: 'pending' });

    expect(repository.create).toHaveBeenCalledWith({
      vacancyId: 30,
      applicantId: 20,
      resumeId: 40,
      coverLetter: 'I am interested',
    });
  });

  it('rejects unavailable vacancies, foreign resumes, and duplicate responses', async () => {
    repository.findApplicant.mockResolvedValue({ id: 20, userId: applicantUser.id });
    repository.findVacancy.mockResolvedValue({ id: 30, isActive: false });
    await expect(service.create({ vacancyId: 30, resumeId: 40 }, applicantUser))
      .rejects.toBeInstanceOf(NotFoundException);

    repository.findVacancy.mockResolvedValue({ id: 30, isActive: true });
    repository.findResume.mockResolvedValue({ id: 40, applicantId: 999 });
    await expect(service.create({ vacancyId: 30, resumeId: 40 }, applicantUser))
      .rejects.toBeInstanceOf(BadRequestException);

    repository.findResume.mockResolvedValue({ id: 40, applicantId: 20 });
    repository.findExisting.mockResolvedValue({ id: 50 });
    await expect(service.create({ vacancyId: 30, resumeId: 40 }, applicantUser))
      .rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('creates a company invite for the owner of the selected resume', async () => {
    repository.findCompanyByUserId.mockResolvedValue({ id: 21, userId: companyUser.id });
    repository.findResumeWithApplicant.mockResolvedValue({
      id: 40,
      applicant: { id: 20, userId: 10 },
    });
    repository.findExistingInvite.mockResolvedValue(null);
    repository.createInvite.mockResolvedValue({
      id: 51,
      status: 'interview',
      resumeId: 40,
      inviteeUserId: 10,
      company: { userId: companyUser.id },
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });

    await expect(service.invite({ resumeId: 40 }, companyUser)).resolves.toMatchObject({
      type: 'resume_invite',
      resumeId: 40,
      seekerId: 10,
      companyId: companyUser.id,
    });
    expect(repository.createInvite).toHaveBeenCalledWith({
      companyId: 21,
      resumeId: 40,
      inviteeUserId: 10,
      status: 'interview',
    });
  });

  it('rejects non-company users and duplicate resume invites', async () => {
    await expect(service.invite({ resumeId: 40 }, applicantUser))
      .rejects.toBeInstanceOf(ForbiddenException);

    repository.findCompanyByUserId.mockResolvedValue({ id: 21, userId: companyUser.id });
    repository.findResumeWithApplicant.mockResolvedValue({
      id: 40,
      applicant: { id: 20, userId: 10 },
    });
    repository.findExistingInvite.mockResolvedValue({ id: 51 });
    await expect(service.invite({ resumeId: 40 }, companyUser))
      .rejects.toBeInstanceOf(ConflictException);
    expect(repository.createInvite).not.toHaveBeenCalled();
  });

  it('lists invitations for the invited seeker in the frontend application format', async () => {
    repository.findApplications.mockResolvedValue([
      [],
      [{
        id: 51,
        status: 'interview',
        resumeId: 40,
        inviteeUserId: applicantUser.id,
        company: { userId: companyUser.id },
        createdAt: new Date('2026-01-01T00:00:00Z'),
      }],
    ]);

    await expect(service.list(applicantUser)).resolves.toMatchObject([{
      id: 51,
      type: 'resume_invite',
      seekerId: applicantUser.id,
      companyId: companyUser.id,
    }]);
    expect(repository.findApplications).toHaveBeenCalledWith(applicantUser.id, 'applicant');
  });
});
