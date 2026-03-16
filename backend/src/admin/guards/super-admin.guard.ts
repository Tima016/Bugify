// ============================================
// SuperAdmin Guard — Restricts access to SUPER_ADMIN role only
// ============================================
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || user.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Access restricted to platform administrators');
        }

        return true;
    }
}
