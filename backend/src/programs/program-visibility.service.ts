// ============================================
// Program Visibility Service
// Service-layer access control for PUBLIC/PRIVATE programs
// ============================================
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuthUser {
    id: string;
    role: 'SUPER_ADMIN' | 'COMPANY' | 'RESEARCHER';
    companyId?: string;
}

@Injectable()
export class ProgramVisibilityService {
    constructor(private prisma: PrismaService) { }

    /**
     * Check if a user can access a specific program.
     * Returns the program if allowed, throws 404 otherwise.
     * PRIVATE programs return 404 (not 403) to hide existence.
     */
    async assertAccess(programId: string, user: AuthUser) {
        const program = await this.prisma.program.findFirst({
            where: { id: programId, deletedAt: null },
        });

        if (!program) throw new NotFoundException('Program not found');

        // SUPER_ADMIN: always allowed
        if (user.role === 'SUPER_ADMIN') return program;

        // COMPANY: must own the program
        if (user.role === 'COMPANY') {
            if (program.companyId !== user.companyId) {
                throw new NotFoundException('Program not found'); // Anti-enumeration
            }
            return program;
        }

        // RESEARCHER: PUBLIC → allowed. PRIVATE → need active invite.
        if (program.programType === 'PUBLIC') return program;

        // PRIVATE: check for active, non-expired invite
        const invite = await this.prisma.programInvite.findFirst({
            where: {
                programId,
                researcherId: user.id,
                status: 'ACCEPTED',
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        });

        if (!invite) {
            throw new NotFoundException('Program not found'); // Anti-enumeration
        }

        return program;
    }

    /**
     * Return all programs visible to this user.
     */
    async findVisiblePrograms(user: AuthUser) {
        if (user.role === 'SUPER_ADMIN') {
            return this.prisma.program.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: 'desc' },
            });
        }

        if (user.role === 'COMPANY') {
            return this.prisma.program.findMany({
                where: { companyId: user.companyId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
            });
        }

        // RESEARCHER: PUBLIC + actively-invited PRIVATE
        const invitedProgramIds = await this.prisma.programInvite.findMany({
            where: {
                researcherId: user.id,
                status: 'ACCEPTED',
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            select: { programId: true },
        });

        return this.prisma.program.findMany({
            where: {
                deletedAt: null,
                status: 'ACTIVE',
                OR: [
                    { programType: 'PUBLIC' },
                    { id: { in: invitedProgramIds.map(i => i.programId) } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Verify researcher has active invite for PRIVATE program.
     * Used as defense-in-depth before report submission.
     */
    async verifyActiveInvite(programId: string, researcherId: string): Promise<void> {
        const invite = await this.prisma.programInvite.findFirst({
            where: {
                programId,
                researcherId,
                status: 'ACCEPTED',
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
        });

        if (!invite) {
            throw new ForbiddenException('No active invite for this program');
        }
    }
}
