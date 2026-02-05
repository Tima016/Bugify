import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, PayoutStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get platform-wide dashboard statistics
     */
    async getDashboardStats() {
        // Total users by role
        const totalUsers = await this.prisma.user.count();
        const researchers = await this.prisma.user.count({
            where: { role: UserRole.RESEARCHER }
        });
        const companies = await this.prisma.user.count({
            where: { role: UserRole.COMPANY }
        });
        const admins = await this.prisma.user.count({
            where: { role: UserRole.ADMIN }
        });

        // Pending payouts
        const pendingPayouts = await this.prisma.payoutRequest.findMany({
            where: { status: PayoutStatus.PENDING },
            select: {
                amount: true
            }
        });
        const pendingPayoutCount = pendingPayouts.length;
        const pendingPayoutValue = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

        // Active programs
        const activePrograms = await this.prisma.program.count({
            where: { status: 'ACTIVE' }
        });

        // Reports statistics
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

        // Platform revenue (total completed payouts)
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

    /**
     * Get all users with optional filters
     */
    async getAllUsers(filters?: {
        role?: UserRole;
        isVerified?: boolean;
        isBanned?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null // Exclude soft-deleted users
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

    /**
     * Toggle company verification status
     */
    async verifyCompany(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isVerified: true, role: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.role !== UserRole.COMPANY) {
            throw new Error('User is not a company');
        }

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { isVerified: !user.isVerified }
        });

        return updated;
    }

    /**
     * Ban or unban a user
     */
    async banUser(userId: string, reason?: string) {
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

        // Create audit log entry
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

        // Create notification for user
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

    /**
     * Update user details
     */
    async updateUser(userId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: UserRole;
    }) {
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

        // Create audit log entry
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

        // Send notification if email or role changed
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

    /**
     * Soft delete user
     */
    async deleteUser(userId: string) {
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

        // Create audit log entry
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

        // Archive user data - data is soft deleted, can be recovered if needed
        // In production, you might want to export user data to cold storage
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

    /**
     * Get all reports with filters (global view)
     */
    async getAllReports(filters?: {
        status?: string;
        severity?: string;
        programId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

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

    /**
     * Get all payout requests (admin view)
     */
    async getAllPayouts(status?: PayoutStatus) {
        const where: any = {};

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

    /**
     * Get all transactions (payments)
     */
    async getTransactionLogs(filters?: {
        status?: string;
        userId?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

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

    /**
     * Get user growth data for analytics
     */
    async getUserGrowthData(days: number = 30) {
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

        // Group by date
        const groupedData = users.reduce((acc, user) => {
            const date = user.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(groupedData).map(([date, count]) => ({
            date,
            count
        }));
    }

    /**
     * Get report submission trends
     */
    async getReportTrends(days: number = 30) {
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

        // Group by date
        const groupedData = reports.reduce((acc, report) => {
            const date = report.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, count: 0, critical: 0, high: 0, medium: 0, low: 0 };
            }
            acc[date].count++;
            if (report.severity === 'CRITICAL') acc[date].critical++;
            if (report.severity === 'HIGH') acc[date].high++;
            if (report.severity === 'MEDIUM') acc[date].medium++;
            if (report.severity === 'LOW') acc[date].low++;
            return acc;
        }, {} as Record<string, any>);

        return Object.values(groupedData);
    }

    /**
     * Get revenue trends
     */
    async getRevenueTrends(days: number = 30) {
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

        // Group by date
        const groupedData = payments.reduce((acc, payment) => {
            const date = payment.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, revenue: 0, count: 0 };
            }
            acc[date].revenue += payment.amount;
            acc[date].count++;
            return acc;
        }, {} as Record<string, any>);

        return Object.values(groupedData);
    }

    /**
     * Process payout request (approve or reject)
     */
    async processPayout(
        payoutId: string,
        status: 'COMPLETED' | 'REJECTED',
        transactionRef?: string,
        adminNotes?: string
    ) {
        const payout = await this.prisma.payoutRequest.findUnique({
            where: { id: payoutId }
        });

        if (!payout) {
            throw new Error('Payout request not found');
        }

        if (payout.status !== PayoutStatus.PENDING) {
            throw new Error('Payout request is not pending');
        }

        const updated = await this.prisma.payoutRequest.update({
            where: { id: payoutId },
            data: {
                status: status === 'COMPLETED' ? PayoutStatus.COMPLETED : PayoutStatus.REJECTED,
                processedAt: new Date(),
                transactionRef: transactionRef,
                // adminNotes: adminNotes // Add this field to schema if needed
            }
        });

        // Create notification for user
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

        // Create audit log entry
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

    /**
     * Get KYC review queue
     */
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

    /**
     * Review KYC submission
     */
    async reviewKyc(userId: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
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

        // Send notification to user
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

        // Create audit log entry
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

    /**
     * Bulk verify companies
     */
    async bulkVerifyCompanies(userIds: string[]) {
        const results = await Promise.allSettled(
            userIds.map(userId => this.verifyCompany(userId))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return { successful, failed, total: userIds.length };
    }

    /**
     * Bulk ban users
     */
    async bulkBanUsers(userIds: string[], reason: string) {
        const results = await Promise.allSettled(
            userIds.map(userId => this.banUser(userId, reason))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return { successful, failed, total: userIds.length };
    }

    /**
     * Bulk delete users
     */
    async bulkDeleteUsers(userIds: string[]) {
        const results = await Promise.allSettled(
            userIds.map(userId => this.deleteUser(userId))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return { successful, failed, total: userIds.length };
    }
}
