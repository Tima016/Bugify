import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory, AppAbility } from './ability.factory';
export declare const CHECK_POLICIES_KEY = "check_policies";
export type PolicyHandler = (ability: AppAbility) => boolean;
export declare const CheckPolicies: (...handlers: PolicyHandler[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class PoliciesGuard implements CanActivate {
    private reflector;
    private abilityFactory;
    constructor(reflector: Reflector, abilityFactory: AbilityFactory);
    canActivate(context: ExecutionContext): boolean;
}
