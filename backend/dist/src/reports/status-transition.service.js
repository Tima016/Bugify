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
var StatusTransitionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusTransitionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatusTransitionService = StatusTransitionService_1 = class StatusTransitionService {
    prisma;
    logger = new common_1.Logger(StatusTransitionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async transition(params) {
        const { reportId, oldStatus, newStatus, changedBy, reason, metadata } = params;
        return this.prisma.$transaction(async (tx) => {
            const report = await tx.report.findUnique({ where: { id: reportId } });
            if (!report) {
                throw new Error(`Report ${reportId} not found`);
            }
            if (report.status !== oldStatus) {
                throw new Error(`Status conflict: expected ${oldStatus}, found ${report.status}. Another user may have updated this report.`);
            }
            await tx.reportStatusTransition.create({
                data: {
                    reportId,
                    oldStatus,
                    newStatus,
                    changedBy,
                    reason,
                    metadata: metadata || undefined,
                },
            });
            const updatedReport = await tx.report.update({
                where: { id: reportId },
                data: {
                    status: newStatus,
                    ...(newStatus === 'RESOLVED' && { resolvedAt: new Date() }),
                },
            });
            this.logger.log(`Report ${reportId}: ${oldStatus} → ${newStatus} by ${changedBy}`);
            return updatedReport;
        });
    }
    async getHistory(reportId) {
        return this.prisma.reportStatusTransition.findMany({
            where: { reportId },
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: { id: true, username: true, role: true },
                },
            },
        });
    }
};
exports.StatusTransitionService = StatusTransitionService;
exports.StatusTransitionService = StatusTransitionService = StatusTransitionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatusTransitionService);
//# sourceMappingURL=status-transition.service.js.map