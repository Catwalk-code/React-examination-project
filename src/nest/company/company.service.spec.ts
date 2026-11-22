import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  const repository = {
    findAll: vi.fn(),
    findById: vi.fn(),
  };
  let service: CompanyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CompanyService(repository as never);
  });

  it('returns reference company information from the repository', async () => {
    const companies = [
      { id: 1, name: 'Acme', _count: { vacancies: 3, reviews: 2 } },
      { id: 2, name: 'Beta', _count: { vacancies: 1, reviews: 0 } },
    ];
    repository.findAll.mockResolvedValue(companies);
    repository.findById.mockResolvedValue({ id: 1, name: 'Acme', vacancies: [] });

    await expect(service.list()).resolves.toEqual(companies);
    await expect(service.get(1)).resolves.toEqual({
      id: 1,
      name: 'Acme',
      vacancies: [],
    });
    expect(repository.findAll).toHaveBeenCalledOnce();
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it('returns a not-found error for an unknown company reference', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.get(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
