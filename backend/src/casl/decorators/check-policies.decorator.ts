import { SetMetadata } from '@nestjs/common';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
    SetMetadata(CHECK_POLICIES_KEY, handlers);

export interface IPolicyHandler {
    handle(ability: any): boolean;
}

type PolicyHandlerCallback = (ability: any) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
