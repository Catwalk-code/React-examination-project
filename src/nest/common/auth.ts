import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'findjob-secret-key';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export type AuthUser = { id: number; email: string; role: 'applicant' | 'company' | 'admin' };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization || '';
    if (!header.startsWith('Bearer ')) throw new UnauthorizedException('Требуется авторизация');
    try {
      request.user = jwt.verify(header.slice(7), JWT_SECRET) as AuthUser;
      return true;
    } catch {
      throw new UnauthorizedException('Недействительный или просроченный токен');
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    if (!request.user) throw new UnauthorizedException('Требуется авторизация');
    if (!roles.includes(request.user.role)) throw new ForbiddenException('Недостаточно прав для этого действия');
    return true;
  }
}
