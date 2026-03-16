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
exports.ProgramVisibilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgramVisibilityService = class ProgramVisibilityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertAccess(programId, user) {
        const program = await this.prisma.program.findFirst({
            where: { id: programId, deletedAt: null },
        });
        if (!program)
            throw new common_1.NotFoundException('Program not found');
        if (user.role === 'SUPER_ADMIN')
            return program;
        if (user.role === 'COMPANY') {
            if (program.companyId !== user.companyId) {
                throw new common_1.NotFoundException('Program not found');
            }
            return program;
        }
        if (program.programType === 'PUBLIC')
            return program;
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
            throw new common_1.NotFoundException('Program not found');
        }
        return program;
    }
    async findVisiblePrograms(user) {
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
    async verifyActiveInvite(programId, researcherId) {
        const invite = await this.prisma.programInvite.findFirst({
            where: {
                programId,
                researcherId,
                status: 'ACCEPTED',
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
        });
        if (!invite) {
            throw new common_1.ForbiddenException('No active invite for this program');
        }
    }
};
exports.ProgramVisibilityService = ProgramVisibilityService;
exports.ProgramVisibilityService = ProgramVisibilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgramVisibilityService);
//# sourceMappingURL=program-visibility.service.js.map