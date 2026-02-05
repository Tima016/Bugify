import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate a unique invitation code
     */
    private generateCode(): string {
        return randomBytes(16).toString('hex').toUpperCase();
    }

    /**
     * Create an invitation code
     */
    async createInvitation(
        companyId: string,
        createdById: string,
        data: {
            email?: string;
            role?: UserRole;
            maxUses?: number;
            expiresAt?: Date;
        },
    ) {
        const code = this.generateCode();

        return this.prisma.invitationCode.create({
            data: {
                code,
                companyId,
                createdById,
                email: data.email,
                role: data.role || UserRole.RESEARCHER,
                maxUses: data.maxUses || 1,
                expiresAt: data.expiresAt,
            },
        });
    }

    /**
     * Validate and use an invitation code
     */
    async validateAndUseCode(code: string, email?: string) {
        const invitation = await this.prisma.invitationCode.findUnique({
            where: { code },
            include: { company: true },
        });

        if (!invitation) {
            throw new NotFoundException('Invalid invitation code');
        }

        // Check if code is active
        if (!invitation.isActive) {
            throw new BadRequestException('Invitation code is no longer active');
        }

        // Check if code has expired
        if (invitation.expiresAt && invitation.expiresAt < new Date()) {
            throw new BadRequestException('Invitation code has expired');
        }

        // Check if max uses reached
        if (invitation.usedCount >= invitation.maxUses) {
            throw new BadRequestException('Invitation code has reached maximum uses');
        }

        // Check if email matches (if specified)
        if (invitation.email && invitation.email !== email) {
            throw new BadRequestException('This invitation is for a different email address');
        }

        // Increment usage count
        await this.prisma.invitationCode.update({
            where: { code },
            data: {
                usedCount: { increment: 1 },
                // Deactivate if max uses reached
                isActive: invitation.usedCount + 1 >= invitation.maxUses ? false : true,
            },
        });

        return invitation;
    }

    /**
     * Get all invitations for a company
     */
    async getCompanyInvitations(companyId: string) {
        return this.prisma.invitationCode.findMany({
            where: { companyId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Deactivate an invitation code
     */
    async deactivateInvitation(code: string, companyId: string) {
        const invitation = await this.prisma.invitationCode.findUnique({
            where: { code },
        });

        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.companyId !== companyId) {
            throw new BadRequestException('Unauthorized to deactivate this invitation');
        }

        return this.prisma.invitationCode.update({
            where: { code },
            data: { isActive: false },
        });
    }

    /**
     * Get invitation statistics
     */
    async getInvitationStats(companyId: string) {
        const invitations = await this.prisma.invitationCode.findMany({
            where: { companyId },
        });

        return {
            total: invitations.length,
            active: invitations.filter(i => i.isActive).length,
            used: invitations.reduce((sum, i) => sum + i.usedCount, 0),
            expired: invitations.filter(i => i.expiresAt && i.expiresAt < new Date()).length,
        };
    }
}
