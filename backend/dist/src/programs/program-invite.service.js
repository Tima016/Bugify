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
var ProgramInviteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramInviteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgramInviteService = ProgramInviteService_1 = class ProgramInviteService {
    prisma;
    logger = new common_1.Logger(ProgramInviteService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createInvite(programId, researcherId, email, inviter, expiresAt) {
        const program = await this.prisma.program.findFirst({
            where: { id: programId, deletedAt: null },
        });
        if (!program)
            throw new common_1.NotFoundException('Program not found');
        if (inviter.role === 'COMPANY' && program.companyId !== inviter.companyId) {
            throw new common_1.ForbiddenException();
        }
        if (inviter.role === 'RESEARCHER') {
            throw new common_1.ForbiddenException('Researchers cannot create invites');
        }
        if (researcherId) {
            const existing = await this.prisma.programInvite.findUnique({
                where: { programId_researcherId: { programId, researcherId } },
            });
            if (existing && existing.status !== 'REVOKED' && existing.status !== 'EXPIRED') {
                throw new common_1.ConflictException('Invite already exists for this researcher');
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
    async acceptInvite(inviteId, user) {
        const invite = await this.prisma.programInvite.findUnique({
            where: { id: inviteId },
        });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.researcherId !== user.id) {
            throw new common_1.ForbiddenException();
        }
        if (invite.status !== 'PENDING') {
            throw new common_1.ForbiddenException(`Invite is ${invite.status.toLowerCase()}`);
        }
        if (invite.expiresAt && invite.expiresAt < new Date()) {
            await this.prisma.programInvite.update({
                where: { id: inviteId },
                data: { status: 'EXPIRED' },
            });
            throw new common_1.ForbiddenException('Invite has expired');
        }
        return this.prisma.programInvite.update({
            where: { id: inviteId },
            data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });
    }
    async revokeInvite(inviteId, user, reason) {
        const invite = await this.prisma.programInvite.findUnique({
            where: { id: inviteId },
            include: { program: true },
        });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (user.role === 'COMPANY' && invite.program.companyId !== user.companyId) {
            throw new common_1.ForbiddenException();
        }
        if (user.role === 'RESEARCHER') {
            throw new common_1.ForbiddenException('Researchers cannot revoke invites');
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
    async listInvites(programId, user) {
        const program = await this.prisma.program.findFirst({
            where: { id: programId, deletedAt: null },
        });
        if (!program)
            throw new common_1.NotFoundException('Program not found');
        if (user.role === 'COMPANY' && program.companyId !== user.companyId) {
            throw new common_1.ForbiddenException();
        }
        if (user.role === 'RESEARCHER') {
            return this.prisma.programInvite.findMany({
                where: { programId, researcherId: user.id },
            });
        }
        return this.prisma.programInvite.findMany({
            where: { programId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ProgramInviteService = ProgramInviteService;
exports.ProgramInviteService = ProgramInviteService = ProgramInviteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgramInviteService);
//# sourceMappingURL=program-invite.service.js.map