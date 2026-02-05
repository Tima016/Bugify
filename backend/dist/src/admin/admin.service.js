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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const totalUsers = await this.prisma.user.count();
        const researchers = await this.prisma.user.count({
            where: { role: client_1.UserRole.RESEARCHER }
        });
        const companies = await this.prisma.user.count({
            where: { role: client_1.UserRole.COMPANY }
        });
        const admins = await this.prisma.user.count({
            where: { role: client_1.UserRole.ADMIN }
        });
        const pendingPayouts = await this.prisma.payoutRequest.findMany({
            where: { status: client_1.PayoutStatus.PENDING },
            select: {
                amount: true
            }
        });
        const pendingPayoutCount = pendingPayouts.length;
        const pendingPayoutValue = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
        const activePrograms = await this.prisma.program.count({
            where: { status: 'ACTIVE' }
        });
        const totalReports = await this.prisma.report.count();
        const pendingReports = await this.prisma.report.count({
            where: {
                status: {
                    in: ['NEW', 'TRIAGED', 'NEEDS_MORE_INFO']
                }
            }
        });
        const resolvedReports = await this.prisma.report.count({
            where: { status: 'RESOLVED' }
        });
        const completedPayouts = await this.prisma.payment.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const platformRevenue = Number(completedPayouts._sum.amount || 0);
        return {
            users: {
                total: totalUsers,
                researchers,
                companies,
                admins
            },
            payouts: {
                pending: {
                    count: pendingPayoutCount,
                    value: pendingPayoutValue
                }
            },
            programs: {
                active: activePrograms
            },
            reports: {
                total: totalReports,
                pending: pendingReports,
                resolved: resolvedReports
            },
            revenue: {
                total: platformRevenue
            }
        };
    }
    async getAllUsers(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null
        };
        if (filters?.role) {
            where.role = filters.role;
        }
        if (filters?.isVerified !== undefined) {
            where.isVerified = filters.isVerified;
        }
        if (filters?.isBanned !== undefined) {
            where.isBanned = filters.isBanned;
        }
        if (filters?.search) {
            where.OR = [
                { email: { contains: filters.search, mode: 'insensitive' } },
                { username: { contains: filters.search, mode: 'insensitive' } },
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isVerified: true,
                    reputationScore: true,
                    totalEarnings: true,
                    createdAt: true,
                    profilePictureUrl: true,
                    isBanned: true,
                    banReason: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.user.count({ where })
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async verifyCompany(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isVerified: true, role: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== client_1.UserRole.COMPANY) {
            throw new Error('User is not a company');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { isVerified: !user.isVerified }
        });
        return updated;
    }
    async banUser(userId, reason) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isBanned: true, username: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const newBanStatus = !user.isBanned;
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: newBanStatus,
                banReason: newBanStatus ? reason : null
            }
        });
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: newBanStatus ? 'USER_BANNED' : 'USER_UNBANNED',
                resourceType: 'USER',
                resourceId: userId,
                metadata: { reason, username: user.username },
                ipAddress: 'admin-action',
                userAgent: 'admin-panel'
            }
        });
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'ACCOUNT',
                title: newBanStatus ? 'Account Banned' : 'Account Unbanned',
                message: newBanStatus
                    ? `Your account has been banned. Reason: ${reason || 'No reason provided'}`
                    : 'Your account has been unbanned and restored.',
                isRead: false
            }
        });
        return updated;
    }
    async updateUser(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data
        });
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'USER_UPDATED',
                resourceType: 'USER',
                resourceId: userId,
                changes: data,
                metadata: { previousEmail: user.email, previousRole: user.role },
                ipAddress: 'admin-action',
                userAgent: 'admin-panel'
            }
        });
        if (data.email && data.email !== user.email) {
            await this.prisma.notification.create({
                data: {
                    userId,
                    type: 'ACCOUNT',
                    title: 'Email Address Updated',
                    message: `Your email address has been updated to ${data.email}`,
                    isRead: false
                }
            });
        }
        if (data.role && data.role !== user.role) {
            await this.prisma.notification.create({
                data: {
                    userId,
                    type: 'ACCOUNT',
                    title: 'Account Role Changed',
                    message: `Your account role has been changed from ${user.role} to ${data.role}`,
                    isRead: false
                }
            });
        }
        return updated;
    }
    async deleteUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const deleted = await this.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() }
        });
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'USER_DELETED',
                resourceType: 'USER',
                resourceId: userId,
                metadata: { username: user.username, email: user.email, deletedAt: new Date() },
                ipAddress: 'admin-action',
                userAgent: 'admin-panel'
            }
        });
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'ACCOUNT',
                title: 'Account Deleted',
                message: 'Your account has been deleted by an administrator.',
                isRead: false
            }
        });
        return deleted;
    }
    async getAllReports(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.severity) {
            where.severity = filters.severity;
        }
        if (filters?.programId) {
            where.programId = filters.programId;
        }
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { reportNumber: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        const [reports, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                include: {
                    researcher: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    program: {
                        select: {
                            id: true,
                            programName: true,
                            company: {
                                select: {
                                    companyName: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.report.count({ where })
        ]);
        return {
            reports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getAllPayouts(status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        const payouts = await this.prisma.payoutRequest.findMany({
            where,
            include: {
                researcher: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return payouts;
    }
    async getTransactionLogs(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.userId) {
            where.researcherId = filters.userId;
        }
        const [transactions, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: {
                    researcher: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    report: {
                        select: {
                            id: true,
                            reportNumber: true,
                            title: true
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.payment.count({ where })
        ]);
        const pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        };
        return { transactions, pagination };
    }
    async getUserGrowthData(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const users = await this.prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                createdAt: true
            },
            orderBy: { createdAt: 'asc' }
        });
        const groupedData = users.reduce((acc, user) => {
            const date = user.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(groupedData).map(([date, count]) => ({
            date,
            count
        }));
    }
    async getReportTrends(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const reports = await this.prisma.report.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                createdAt: true,
                severity: true
            },
            orderBy: { createdAt: 'asc' }
        });
        const groupedData = reports.reduce((acc, report) => {
            const date = report.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, count: 0, critical: 0, high: 0, medium: 0, low: 0 };
            }
            acc[date].count++;
            if (report.severity === 'CRITICAL')
                acc[date].critical++;
            if (report.severity === 'HIGH')
                acc[date].high++;
            if (report.severity === 'MEDIUM')
                acc[date].medium++;
            if (report.severity === 'LOW')
                acc[date].low++;
            return acc;
        }, {});
        return Object.values(groupedData);
    }
    async getRevenueTrends(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const payments = await this.prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate
                },
                status: 'COMPLETED'
            },
            select: {
                createdAt: true,
                amount: true
            },
            orderBy: { createdAt: 'asc' }
        });
        const groupedData = payments.reduce((acc, payment) => {
            const date = payment.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, revenue: 0, count: 0 };
            }
            acc[date].revenue += payment.amount;
            acc[date].count++;
            return acc;
        }, {});
        return Object.values(groupedData);
    }
    async processPayout(payoutId, status, transactionRef, adminNotes) {
        const payout = await this.prisma.payoutRequest.findUnique({
            where: { id: payoutId }
        });
        if (!payout) {
            throw new Error('Payout request not found');
        }
        if (payout.status !== client_1.PayoutStatus.PENDING) {
            throw new Error('Payout request is not pending');
        }
        const updated = await this.prisma.payoutRequest.update({
            where: { id: payoutId },
            data: {
                status: status === 'COMPLETED' ? client_1.PayoutStatus.COMPLETED : client_1.PayoutStatus.REJECTED,
                processedAt: new Date(),
                transactionRef: transactionRef,
            }
        });
        await this.prisma.notification.create({
            data: {
                userId: payout.researcherId,
                type: 'PAYMENT',
                title: status === 'COMPLETED' ? 'Payout Approved' : 'Payout Rejected',
                message: status === 'COMPLETED'
                    ? `Your payout request of $${payout.amount} has been approved and processed. Transaction ref: ${transactionRef}`
                    : `Your payout request of $${payout.amount} has been rejected. ${adminNotes || ''}`,
                isRead: false
            }
        });
        await this.prisma.auditLog.create({
            data: {
                userId: payout.researcherId,
                action: status === 'COMPLETED' ? 'PAYOUT_APPROVED' : 'PAYOUT_REJECTED',
                resourceType: 'PAYOUT',
                resourceId: payoutId,
                metadata: { amount: payout.amount, transactionRef, adminNotes },
                ipAddress: 'admin-action',
                userAgent: 'admin-panel'
            }
        });
        return updated;
    }
    async getKycQueue() {
        const users = await this.prisma.user.findMany({
            where: {
                kycStatus: 'PENDING'
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                kycStatus: true,
                kycDocuments: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return users;
    }
    async reviewKyc(userId, status, notes) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.kycStatus !== 'PENDING') {
            throw new Error('KYC is not pending review');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: status,
            }
        });
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'ACCOUNT',
                title: status === 'APPROVED' ? 'KYC Approved' : 'KYC Rejected',
                message: status === 'APPROVED'
                    ? 'Your KYC verification has been approved. You now have full access to the platform.'
                    : `Your KYC verification has been rejected. ${notes || 'Please resubmit with correct information.'}`,
                isRead: false
            }
        });
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: status === 'APPROVED' ? 'KYC_APPROVED' : 'KYC_REJECTED',
                resourceType: 'KYC',
                resourceId: userId,
                metadata: { notes, previousStatus: user.kycStatus },
                ipAddress: 'admin-action',
                userAgent: 'admin-panel'
            }
        });
        return updated;
    }
    async bulkVerifyCompanies(userIds) {
        const results = await Promise.allSettled(userIds.map(userId => this.verifyCompany(userId)));
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        return { successful, failed, total: userIds.length };
    }
    async bulkBanUsers(userIds, reason) {
        const results = await Promise.allSettled(userIds.map(userId => this.banUser(userId, reason)));
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        return { successful, failed, total: userIds.length };
    }
    async bulkDeleteUsers(userIds) {
        const results = await Promise.allSettled(userIds.map(userId => this.deleteUser(userId)));
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        return { successful, failed, total: userIds.length };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map