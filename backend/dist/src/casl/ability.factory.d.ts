import { PureAbility, subject } from '@casl/ability';
type Actions = 'read' | 'create' | 'update' | 'delete' | 'manage';
type Subjects = 'User' | 'Program' | 'Report' | 'Payout' | 'SecurityAlert' | 'AuditLog' | 'LedgerEntry' | 'ProgramInvite' | 'Settings' | 'SystemHealth' | 'all';
export type AppAbility = PureAbility<[Actions, Subjects]>;
export interface PolicyUser {
    id: string;
    role: 'SUPER_ADMIN' | 'COMPANY' | 'RESEARCHER';
    companyId?: string;
}
export declare class AbilityFactory {
    createForUser(user: PolicyUser): AppAbility;
}
export { subject };
