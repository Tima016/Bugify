// ============================================
// Program Invite Service
// Handles invite/accept/revoke lifecycle for PRIVATE programs
// ============================================
import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './program-visibility.service';

@Injectable()
export class ProgramInviteService {
    private readonly logger = new Logger(ProgramInviteService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Create an invite for a researcher to a PRIVATE program.
     * Only the program owner (COMPANY) or SUPER_ADMIN can invite.
     */
    async createInvite(
        programId: string,
        researcherId: string | null,
        email: string | null,
        inviter: AuthUser,
        expiresAt?: Date,
    ) {
        // Verify program exists and inviter has access
        const program = await this.prisma.program.findFirst({
            where: { id: programId, deletedAt: null },
        });

        if (!program) throw new NotFoundException('Program not found');

        if (inviter.role === 'COMPANY' && program.companyId !== inviter.companyId) {
            throw new ForbiddenException();
        }

        if (inviter.role === 'RESEARCHER') {
            throw new ForbiddenException('Researchers cannot create invites');
        }

        // Check for existing invite
        if (researcherId) {
            const existing = await this.prisma.programInvite.findUnique({
                where: { programId_researcherId: { programId, researcherId } },
            });
            if (existing && existing.status !== 'REVOKED' && existing.status !== 'EXPIRED') {
                throw new ConflictException('Invite already exists for this researcher');
            }
        }

        return this.prisma.programInvite.create({
            data: {
                programId,
                researcherId,
                email,
                invitedBy: inviter.id,
                expiresAt,
            },
        });
    }

    /**
     * Researcher accepts a pending invite.
     */
    async acceptInvite(inviteId: string, user: AuthUser) {
        const invite = await this.prisma.programInvite.findUnique({
            where: { id: inviteId },
        });

        if (!invite) throw new NotFoundException('Invite not found');

        // Must be the invited researcher
        if (invite.researcherId !== user.id) {
            throw new ForbiddenException();
        }

        if (invite.status !== 'PENDING') {
            throw new ForbiddenException(`Invite is ${invite.status.toLowerCase()}`);
        }

        // Check expiry
        if (invite.expiresAt && invite.expiresAt < new Date()) {
            await this.prisma.programInvite.update({
                where: { id: inviteId },
                data: { status: 'EXPIRED' },
            });
            throw new ForbiddenException('Invite has expired');
        }

        return this.prisma.programInvite.update({
            where: { id: inviteId },
            data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });
    }

    /**
     * Revoke an invite. Company can revoke own program invites. Admin can revoke any.
     */
    async revokeInvite(inviteId: string, user: AuthUser, reason: string) {
        const invite = await this.prisma.programInvite.findUnique({
            where: { id: inviteId },
            include: { program: true },
        });

        if (!invite) throw new NotFoundException('Invite not found');

        // Company can only revoke their own program invites
        if (user.role === 'COMPANY' && invite.program.companyId !== user.companyId) {
            throw new ForbiddenException();
        }

        if (user.role === 'RESEARCHER') {
            throw new ForbiddenException('Researchers cannot revoke invites');
        }

        return this.prisma.programInvite.update({
            where: { id: inviteId },
            data: {
                status: 'REVOKED',
                revokedAt: new Date(),
                revokedBy: user.id,
                revokedReason: reason,
            },
        });
    }

    /**
     * List invites for a program.
     */
    async listInvites(programId: string, user: AuthUser) {
        const program = await this.prisma.program.findFirst({
            where: { id: programId, deletedAt: null },
        });

        if (!program) throw new NotFoundException('Program not found');

        if (user.role === 'COMPANY' && program.companyId !== user.companyId) {
            throw new ForbiddenException();
        }

        if (user.role === 'RESEARCHER') {
            // Researchers can only see their own invites
            return this.prisma.programInvite.findMany({
                where: { programId, researcherId: user.id },
            });
        }

        return this.prisma.programInvite.findMany({
            where: { programId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
