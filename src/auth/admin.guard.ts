// src/auth/admin.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Role } from './roles.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';

    // The JWT strategy has already authenticated the user and attached it to request.user
    // We just need to check if they have admin role
    if (!user) {
      this.logger.warn(
        `Access denied: User not authenticated. IP: ${ip}. Operation: ${context.getClass().name} ${context.getHandler().name}`,
      );
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== Role.ADMIN) {
      this.logger.warn(
        `Access denied: User ${user.email} with id: ${user.id} does not have admin role. IP: ${ip}. Operation: ${context.getClass().name} ${context.getHandler().name}`,
      );
      throw new ForbiddenException('Access denied - Admin role required');
    }

    this.logger.log(
      `Access granted: User ${user.email} with id: ${user.id} is admin. IP: ${ip}. Operation: ${context.getClass().name} ${context.getHandler().name}`,
    );
    return true;
  }
}
