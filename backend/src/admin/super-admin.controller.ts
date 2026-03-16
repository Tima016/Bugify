// ============================================
// Super Admin Controller — Platform administration endpoints
// All routes require JWT + SUPER_ADMIN role
// ============================================
import {
    Controller, Get, Post, Patch, Param, Body, Query,
    UseGuards, HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AlertService } from '../common/security/alert.service';
import { FraudEngine } from '../common/security/fraud-engine.service';
import { MetricsService } from '../common/metrics/metrics.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminController {
    constructor(
        private prisma: PrismaService,
        private alertService: AlertService,
        private fraudEngine: FraudEngine,
        private metricsService: MetricsService,
    ) { }

    // ==================== OVERVIEW ====================

    @Get('overview')
    async getOverview() {
        const [
            userCount,
            researcherCount,
            companyCount,
            activePrograms,
            reportsThisMonth,
            openAlerts,
        ] = await Promise.all([
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

    // ==================== USERS ====================

    @Get('users')
    async listUsers(
        @Query('role') role?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        const skip = (Number(page) - 1) * Number(limit);
        const where: any = {};

        if (role) where.role = role;
        if (status === 'banned') where.isBanned = true;
        if (status === 'active') where.isBanned = false;
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

    @Patch('users/:id/ban')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    async banUser(
        @Param('id') userId: string,
        @Body('reason') reason: string,
        @GetUser() admin: any,
    ) {
        if (!reason || reason.length < 10) {
            throw new ForbiddenException('Ban reason must be at least 10 characters');
        }

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: true },
        });

        // Audit log
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

    @Patch('users/:id/unban')
    @HttpCode(HttpStatus.OK)
    async unbanUser(
        @Param('id') userId: string,
        @GetUser() admin: any,
    ) {
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

    // ==================== PROGRAMS ====================

    @Get('programs')
    async listPrograms(
        @Query('status') status?: string,
        @Query('type') type?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        const skip = (Number(page) - 1) * Number(limit);
        const where: any = { deletedAt: null };

        if (status) where.status = status;
        if (type) where.programType = type;

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

    @Patch('programs/:id/pause')
    @HttpCode(HttpStatus.OK)
    async pauseProgram(
        @Param('id') programId: string,
        @Body('reason') reason: string,
        @GetUser() admin: any,
    ) {
        if (!reason) throw new ForbiddenException('Reason required');

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

    @Patch('programs/:id/resume')
    @HttpCode(HttpStatus.OK)
    async resumeProgram(
        @Param('id') programId: string,
        @GetUser() admin: any,
    ) {
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

    // ==================== PAYOUTS ====================

    @Get('payouts')
    async listPayouts(
        @Query('status') status?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        const skip = (Number(page) - 1) * Number(limit);
        const where: any = {};
        if (status) where.status = status;

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

    @Patch('payouts/:id/freeze')
    @HttpCode(HttpStatus.OK)
    async freezePayout(
        @Param('id') payoutId: string,
        @Body('reason') reason: string,
        @GetUser() admin: any,
    ) {
        if (!reason) throw new ForbiddenException('Reason required');

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

    // ==================== SECURITY CENTER ====================

    @Get('security/alerts')
    async getSecurityAlerts(
        @Query('severity') severity?: string,
        @Query('category') category?: string,
        @Query('status') status = 'OPEN',
        @Query('limit') limit = '50',
    ) {
        const where: any = {};
        if (severity) where.severity = severity;
        if (category) where.category = category;
        if (status) where.status = status;

        return this.prisma.securityAlert.findMany({
            where,
            orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
            take: Number(limit),
        });
    }

    @Patch('security/alerts/:id/resolve')
    @HttpCode(HttpStatus.OK)
    async resolveAlert(
        @Param('id') alertId: string,
        @Body('reason') reason: string,
        @Body('status') resolveStatus: 'RESOLVED' | 'FALSE_POSITIVE',
        @GetUser() admin: any,
    ) {
        if (!reason || reason.length < 10) {
            throw new ForbiddenException('Resolution reason must be at least 10 characters');
        }

        const alert = await this.alertService.resolve(
            alertId,
            admin.id,
            resolveStatus || 'RESOLVED',
        );

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

    @Get('security/stats')
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

    // ==================== SYSTEM HEALTH ====================

    @Get('health/metrics')
    async getSystemMetrics() {
        const metricsText = await this.metricsService.getMetrics();
        return { format: 'prometheus', data: metricsText };
    }

    // ==================== AUDIT LOG ====================

    @Get('audit-log')
    async getAuditLog(
        @Query('action') action?: string,
        @Query('userId') userId?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '50',
    ) {
        const skip = (Number(page) - 1) * Number(limit);
        const where: any = {};
        if (action) where.action = action;
        if (userId) where.userId = userId;

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
}
