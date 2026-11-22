import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const repository = {
    findByEmail: vi.fn(),
    create: vi.fn(),
  };
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(repository as never);
  });

  it('registers an applicant and returns a token without exposing the password hash', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue({
      id: 1,
      email: 'anna@example.com',
      name: 'Anna Smith',
      role: 'applicant',
      passhash: bcrypt.hashSync('password', 10),
      applicant: { firstName: 'Anna', lastName: 'Smith', phone: '' },
      company: null,
    });

    const result = await service.register({
      email: 'anna@example.com',
      password: 'password',
      role: 'seeker',
      name: 'Anna Smith',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'anna@example.com',
        role: 'applicant',
        applicant: {
          create: { firstName: 'Anna', lastName: 'Smith', phone: '' },
        },
      }),
    );
    expect(result.user).not.toHaveProperty('passhash');
    expect(result.user.email).toBe('anna@example.com');
    expect(result.token).toEqual(expect.any(String));
  });

  it('rejects invalid registration data and duplicate emails', async () => {
    await expect(service.register({ email: '', password: '', role: 'unknown' }))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(repository.findByEmail).not.toHaveBeenCalled();

    repository.findByEmail.mockResolvedValue({ id: 1, email: 'used@example.com' });
    await expect(service.register({
      email: 'used@example.com',
      password: 'password',
      role: 'applicant',
    })).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('logs in with valid credentials and rejects unknown or incorrect credentials', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 2,
      email: 'anna@example.com',
      role: 'company',
      passhash: bcrypt.hashSync('password', 10),
    });

    const result = await service.login({
      email: 'anna@example.com',
      password: 'password',
    });

    expect(result.user).toEqual({
      id: 2,
      email: 'anna@example.com',
      role: 'company',
    });
    expect(result.token).toEqual(expect.any(String));

    repository.findByEmail.mockResolvedValue(null);
    await expect(service.login({
      email: 'missing@example.com',
      password: 'password',
    })).rejects.toBeInstanceOf(UnauthorizedException);

    repository.findByEmail.mockResolvedValue({
      id: 2,
      email: 'anna@example.com',
      role: 'company',
      passhash: bcrypt.hashSync('password', 10),
    });
    await expect(service.login({
      email: 'anna@example.com',
      password: 'wrong-password',
    })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
