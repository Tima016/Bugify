import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './program-visibility.service';
export declare class ProgramInviteService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createInvite(programId: string, researcherId: string | null, email: string | null, inviter: AuthUser, expiresAt?: Date): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProgramInviteStatus;
        programId: string;
        researcherId: string | null;
        expiresAt: Date | null;
        invitedBy: string;
        acceptedAt: Date | null;
        revokedAt: Date | null;
        revokedBy: string | null;
        revokedReason: string | null;
    }>;
    acceptInvite(inviteId: string, user: AuthUser): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProgramInviteStatus;
        programId: string;
        researcherId: string | null;
        expiresAt: Date | null;
        invitedBy: string;
        acceptedAt: Date | null;
        revokedAt: Date | null;
        revokedBy: string | null;
        revokedReason: string | null;
    }>;
    revokeInvite(inviteId: string, user: AuthUser, reason: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProgramInviteStatus;
        programId: string;
        researcherId: string | null;
        expiresAt: Date | null;
        invitedBy: string;
        acceptedAt: Date | null;
        revokedAt: Date | null;
        revokedBy: string | null;
        revokedReason: string | null;
    }>;
    listInvites(programId: string, user: AuthUser): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProgramInviteStatus;
        programId: string;
        researcherId: string | null;
        expiresAt: Date | null;
        invitedBy: string;
        acceptedAt: Date | null;
        revokedAt: Date | null;
        revokedBy: string | null;
        revokedReason: string | null;
    }[]>;
}
