"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let InvitationService = class InvitationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateCode() {
        return (0, crypto_1.randomBytes)(16).toString('hex').toUpperCase();
    }
    async createInvitation(companyId, createdById, data) {
        const code = this.generateCode();
        return this.prisma.invitationCode.create({
            data: {
                code,
                companyId,
                createdById,
                email: data.email,
                role: data.role || client_1.UserRole.RESEARCHER,
                maxUses: data.maxUses || 1,
                expiresAt: data.expiresAt,
            },
        });
    }
    async validateAndUseCode(code, email) {
        const invitation = await this.prisma.invitationCode.findUnique({
            where: { code },
            include: { company: true },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invalid invitation code');
        }
        if (!invitation.isActive) {
            throw new common_1.BadRequestException('Invitation code is no longer active');
        }
        if (invitation.expiresAt && invitation.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invitation code has expired');
        }
        if (invitation.usedCount >= invitation.maxUses) {
            throw new common_1.BadRequestException('Invitation code has reached maximum uses');
        }
        if (invitation.email && invitation.email !== email) {
            throw new common_1.BadRequestException('This invitation is for a different email address');
        }
        await this.prisma.invitationCode.update({
            where: { code },
            data: {
                usedCount: { increment: 1 },
                isActive: invitation.usedCount + 1 >= invitation.maxUses ? false : true,
            },
        });
        return invitation;
    }
    async getCompanyInvitations(companyId) {
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
    async deactivateInvitation(code, companyId) {
        const invitation = await this.prisma.invitationCode.findUnique({
            where: { code },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.companyId !== companyId) {
            throw new common_1.BadRequestException('Unauthorized to deactivate this invitation');
        }
        return this.prisma.invitationCode.update({
            where: { code },
            data: { isActive: false },
        });
    }
    async getInvitationStats(companyId) {
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
};
exports.InvitationService = InvitationService;
exports.InvitationService = InvitationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvitationService);
//# sourceMappingURL=invitation.service.js.map