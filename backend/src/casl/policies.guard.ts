// ============================================
// CASL Policy Guard — Declarative permission checking via decorator
// Usage: @CheckPolicies((ability) => ability.can('read', 'SecurityAlert'))
// ============================================
import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory, AppAbility } from './ability.factory';

export const CHECK_POLICIES_KEY = 'check_policies';
export type PolicyHandler = (ability: AppAbility) => boolean;

/**
 * Decorator to attach policy checks to route handlers.
 * @example @CheckPolicies((ability) => ability.can('read', 'SecurityAlert'))
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
    SetMetadata(CHECK_POLICIES_KEY, handlers);

@Injectable()
export class PoliciesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private abilityFactory: AbilityFactory,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const handlers = this.reflector.get<PolicyHandler[]>(
            CHECK_POLICIES_KEY,
            context.getHandler(),
        ) || [];

        if (handlers.length === 0) return true; // No policy defined — allow (guards stack)

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) return false;

        const ability = this.abilityFactory.createForUser(user);
        return handlers.every(handler => handler(ability));
    }
}
