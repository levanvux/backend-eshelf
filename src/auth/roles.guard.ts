import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '../generated/prisma/client.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { userId: string; email: string; role: Role } }>();
    if (!user || !roles.includes(user.role)) {
      throw new Error('Unauthorized');
    }
    return true;
  }
}
