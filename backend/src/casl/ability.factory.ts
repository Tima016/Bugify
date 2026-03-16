// ============================================
// CASL Ability Factory — Centralized permission definitions
// Single source of truth for all role-based access control
// ============================================
import { AbilityBuilder, PureAbility, createMongoAbility, subject } from '@casl/ability';
import { Injectable } from '@nestjs/common';

type Actions = 'read' | 'create' | 'update' | 'delete' | 'manage';
type Subjects =
    | 'User' | 'Program' | 'Report' | 'Payout' | 'SecurityAlert'
    | 'AuditLog' | 'LedgerEntry' | 'ProgramInvite' | 'Settings'
    | 'SystemHealth' | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;

export interface PolicyUser {
    id: string;
    role: 'SUPER_ADMIN' | 'COMPANY' | 'RESEARCHER';
    companyId?: string;
}

@Injectable()
export class AbilityFactory {
    createForUser(user: PolicyUser): AppAbility {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        switch (user.role) {
            case 'SUPER_ADMIN':
                can('manage', 'all');
                // Separation of duties — admin doesn't participate in platform
                cannot('create', 'Program');
                cannot('create', 'Report');
                // Immutable records — nobody can touch
                cannot('delete', 'AuditLog');
                cannot('update', 'AuditLog');
                cannot('delete', 'LedgerEntry');
                cannot('update', 'LedgerEntry');
                break;

            case 'COMPANY':
                // Programs — own company only
                can('create', 'Program');
                can('read', 'Program', { companyId: user.companyId });
                can('update', 'Program', { companyId: user.companyId });
                can('delete', 'Program', { companyId: user.companyId });
                // Reports — own programs only (triage)
                can('read', 'Report');   // Filtered by service layer
                can('update', 'Report'); // Status transitions
                // Payouts — own programs
                can('read', 'Payout');
                can('update', 'Payout'); // Approve own
                // Invites — own programs
                can('create', 'ProgramInvite');
                can('read', 'ProgramInvite');
                can('update', 'ProgramInvite');
                // Explicit denials
                cannot('read', 'SecurityAlert');
                cannot('read', 'AuditLog');
                cannot('read', 'LedgerEntry');
                cannot('read', 'Settings');
                cannot('read', 'SystemHealth');
                cannot('manage', 'User');
                break;

            case 'RESEARCHER':
                // Reports — create and read own
                can('create', 'Report');
                can('read', 'Report', { researcherId: user.id });
                can('update', 'Report', { researcherId: user.id }); // Draft only (enforced at service)
                // Programs — public visible
                can('read', 'Program');
                // Payouts — own only
                can('read', 'Payout', { researcherId: user.id });
                // Profile
                can('read', 'User', { id: user.id });
                can('update', 'User', { id: user.id });
                // Explicit denials
                cannot('read', 'SecurityAlert');
                cannot('read', 'AuditLog');
                cannot('read', 'LedgerEntry');
                cannot('read', 'Settings');
                cannot('read', 'SystemHealth');
                cannot('create', 'Program');
                cannot('create', 'ProgramInvite');
                break;
        }

        return build();
    }
}

// Re-export subject helper for use in service layer
export { subject };
