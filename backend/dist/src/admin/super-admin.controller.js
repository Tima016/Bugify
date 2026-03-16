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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const super_admin_guard_1 = require("./guards/super-admin.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const alert_service_1 = require("../common/security/alert.service");
const fraud_engine_service_1 = require("../common/security/fraud-engine.service");
const metrics_service_1 = require("../common/metrics/metrics.service");
let SuperAdminController = class SuperAdminController {
    prisma;
    alertService;
    fraudEngine;
    metricsService;
    constructor(prisma, alertService, fraudEngine, metricsService) {
        this.prisma = prisma;
        this.alertService = alertService;
        this.fraudEngine = fraudEngine;
        this.metricsService = metricsService;
    }
    async getOverview() {
        const [userCount, researcherCount, companyCount, activePrograms, reportsThisMonth, openAlerts,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'RESEARCHER' } }),
            this.prisma.user.count({ where: { role: 'COMPANY' } }),
            this.prisma.program.count({ where: { status: 'ACTIVE', deletedAt: null } }),
            this.prisma.report.count({
                where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            }),
            this.prisma.securityAlert.count({ where: { status: 'OPEN' } }),
        ]);
        return {
            users: { total: userCount, researchers: researcherCount, companies: companyCount },
            programs: { active: activePrograms },
            reports: { thisMonth: reportsThisMonth },
            security: { openAlerts },
        };
    }
    async listUsers(role, status, search, page = '1', limit = '20') {
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (role)
            where.role = role;
        if (status === 'banned')
            where.isBanned = true;
        if (status === 'active')
            where.isBanned = false;
        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true, username: true, email: true, role: true,
                    kycStatus: true, isBanned: true, createdAt: true,
                    _count: { select: { reports: true, payoutRequests: true } },
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { data: users, total, page: Number(page), limit: Number(limit) };
    }
    async banUser(userId, reason, admin) {
        if (!reason || reason.length < 10) {
            throw new common_1.ForbiddenException('Ban reason must be at least 10 characters');
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: true },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'ADMIN_BAN_USER',
                userId: admin.id,
                resourceType: 'USER',
                resourceId: userId,
                changes: { reason, targetUsername: user.username },
            },
        });
        return { message: 'User banned', userId };
    }
    async unbanUser(userId, admin) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: false },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'ADMIN_UNBAN_USER',
                userId: admin.id,
                resourceType: 'USER',
                resourceId: userId,
                changes: {},
            },
        });
        return { message: 'User unbanned', userId };
    }
    async listPrograms(status, type, page = '1', limit = '20') {
        const skip = (Number(page) - 1) * Number(limit);
        const where = { deletedAt: null };
        if (status)
            where.status = status;
        if (type)
            where.programType = type;
        const [programs, total] = await Promise.all([
            this.prisma.program.findMany({
                where,
                include: {
                    company: { select: { companyName: true } },
                    _count: { select: { reports: true } },
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.program.count({ where }),
        ]);
        return { data: programs, total, page: Number(page), limit: Number(limit) };
    }
    async pauseProgram(programId, reason, admin) {
        if (!reason)
            throw new common_1.ForbiddenException('Reason required');
        await this.prisma.program.update({
            where: { id: programId },
            data: { status: 'PAUSED' },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'ADMIN_PAUSE_PROGRAM',
                userId: admin.id,
                resourceType: 'PROGRAM',
                resourceId: programId,
                changes: { reason },
            },
        });
        return { message: 'Program paused', programId };
    }
    async resumeProgram(programId, admin) {
        await this.prisma.program.update({
            where: { id: programId },
            data: { status: 'ACTIVE' },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'ADMIN_RESUME_PROGRAM',
                userId: admin.id,
                resourceType: 'PROGRAM',
                resourceId: programId,
                changes: {},
            },
        });
        return { message: 'Program resumed', programId };
    }
    async listPayouts(status, page = '1', limit = '20') {
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (status)
            where.status = status;
        const [payouts, total] = await Promise.all([
            this.prisma.payoutRequest.findMany({
                where,
                include: {
                    researcher: { select: { username: true, email: true } },
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payoutRequest.count({ where }),
        ]);
        return { data: payouts, total, page: Number(page), limit: Number(limit) };
    }
    async freezePayout(payoutId, reason, admin) {
        if (!reason)
            throw new common_1.ForbiddenException('Reason required');
        await this.prisma.payoutRequest.update({
            where: { id: payoutId },
            data: { status: 'REJECTED', notes: `FROZEN by admin: ${reason}` },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'ADMIN_FREEZE_PAYOUT',
                userId: admin.id,
                resourceType: 'PAYOUT',
                resourceId: payoutId,
                changes: { reason },
            },
        });
        return { message: 'Payout frozen', payoutId };
    }
    async getSecurityAlerts(severity, category, status = 'OPEN', limit = '50') {
        const where = {};
        if (severity)
            where.severity = severity;
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        return this.prisma.securityAlert.findMany({
            where,
            orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
            take: Number(limit),
        });
    }
    async resolveAlert(alertId, reason, resolveStatus, admin) {
        if (!reason || reason.length < 10) {
            throw new common_1.ForbiddenException('Resolution reason must be at least 10 characters');
        }
        const alert = await this.alertService.resolve(alertId, admin.id, resolveStatus || 'RESOLVED');
        await this.prisma.auditLog.create({
            data: {
                action: resolveStatus === 'FALSE_POSITIVE' ? 'ALERT_FALSE_POSITIVE' : 'ALERT_RESOLVED',
                userId: admin.id,
                resourceType: 'SECURITY_ALERT',
                resourceId: alertId,
                changes: { reason, resolveStatus },
            },
        });
        return alert;
    }
    async getSecurityStats() {
        const [openBySeverity, openByCategory] = await Promise.all([
            this.prisma.securityAlert.groupBy({
                by: ['severity'],
                where: { status: 'OPEN' },
                _count: true,
            }),
            this.prisma.securityAlert.groupBy({
                by: ['category'],
                where: { status: 'OPEN' },
                _count: true,
            }),
        ]);
        return { bySeverity: openBySeverity, byCategory: openByCategory };
    }
    async getSystemMetrics() {
        const metricsText = await this.metricsService.getMetrics();
        return { format: 'prometheus', data: metricsText };
    }
    async getAuditLog(action, userId, page = '1', limit = '50') {
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (action)
            where.action = action;
        if (userId)
            where.userId = userId;
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return { data: logs, total, page: Number(page), limit: Number(limit) };
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/ban'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "banUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/unban'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "unbanUser", null);
__decorate([
    (0, common_1.Get)('programs'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "listPrograms", null);
__decorate([
    (0, common_1.Patch)('programs/:id/pause'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "pauseProgram", null);
__decorate([
    (0, common_1.Patch)('programs/:id/resume'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "resumeProgram", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "listPayouts", null);
__decorate([
    (0, common_1.Patch)('payouts/:id/freeze'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "freezePayout", null);
__decorate([
    (0, common_1.Get)('security/alerts'),
    __param(0, (0, common_1.Query)('severity')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getSecurityAlerts", null);
__decorate([
    (0, common_1.Patch)('security/alerts/:id/resolve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Body)('status')),
    __param(3, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "resolveAlert", null);
__decorate([
    (0, common_1.Get)('security/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getSecurityStats", null);
__decorate([
    (0, common_1.Get)('health/metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Get)('audit-log'),
    __param(0, (0, common_1.Query)('action')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAuditLog", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alert_service_1.AlertService,
        fraud_engine_service_1.FraudEngine,
        metrics_service_1.MetricsService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map