import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResponseService } from './response.service';

describe('ResponseService', () => {
  const repository = {
    findApplicant: vi.fn(),
    findVacancy: vi.fn(),
    findResume: vi.fn(),
    findExisting: vi.fn(),
    create: vi.fn(),
    findMy: vi.fn(),
  };
  let service: ResponseService;
  const applicantUser = { id: 10, email: 'user@example.com', role: 'applicant' as const };

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
});
