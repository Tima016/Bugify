import { Injectable } from '@nestjs/common';
import { AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability';
import { PrismaQuery, Subjects, createPrismaAbility } from '@casl/prisma';
import { User, Program, Report, Comment, Payment } from '@prisma/client';

type AppSubjects = Subjects<{
    User: User;
    Program: Program;
    Report: Report;
    Comment: Comment;
    Payment: Payment;
}> | 'all';

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(
            createPrismaAbility as unknown as AbilityClass<AppAbility>,
        );

        // Admin permissions
        if (user.role === 'ADMIN') {
            can('manage', 'all'); // Full access
        }

        // Researcher permissions
        if (user.role === 'RESEARCHER') {
            // Can read all programs
            can('read', 'Program');

            // Can create reports
            can('create', 'Report');

            // Can manage own reports
            can('update', 'Report', { researcherId: user.id });
            can('read', 'Report', { researcherId: user.id });
            can('delete', 'Report', { researcherId: user.id, status: 'RESOLVED' } as any);

            // Can read own payments
            can('read', 'Payment', { researcherId: user.id });

            // Can manage own profile
            can('update', 'User', { id: user.id });
            can('read', 'User', { id: user.id });

            // Can create comments on own reports
            can('create', 'Comment');
            can('update', 'Comment', { userId: user.id });
            can('delete', 'Comment', { userId: user.id });
        }

        // Company permissions
        if (user.role === 'COMPANY') {
            // Can manage own programs
            can('create', 'Program');
            can('update', 'Program', { company: { users: { some: { id: user.id } } } });
            can('read', 'Program', { company: { users: { some: { id: user.id } } } });
            can('delete', 'Program', { company: { users: { some: { id: user.id } } } });

            // Can read reports for own programs
            can('read', 'Report', { program: { company: { users: { some: { id: user.id } } } } });
            can('update', 'Report', { program: { company: { users: { some: { id: user.id } } } } });

            // Can manage payments for own programs
            can('create', 'Payment');
            can('read', 'Payment', { company: { users: { some: { id: user.id } } } } as any);

            // Can manage own profile
            can('update', 'User', { id: user.id });
            can('read', 'User', { id: user.id });

            // Can create comments on reports for own programs
            can('create', 'Comment');
            can('update', 'Comment', { userId: user.id });
            can('delete', 'Comment', { userId: user.id });
        }

        // Everyone can read public data
        can('read', 'User', { isVerified: true });

        return build();
    }
}
