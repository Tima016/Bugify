export declare const CHECK_POLICIES_KEY = "check_policy";
export declare const CheckPolicies: (...handlers: PolicyHandler[]) => import("@nestjs/common").CustomDecorator<string>;
export interface IPolicyHandler {
    handle(ability: any): boolean;
}
type PolicyHandlerCallback = (ability: any) => boolean;
export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
export {};
