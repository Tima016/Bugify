import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                countryCode: true,
                profilePictureUrl: true,
                bio: true,
                role: true,
                reputationScore: true,
                totalEarnings: true,
                isVerified: true,
                isEmailVerified: true,
                skills: true,
                socialLinks: true,
                preferredLanguage: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        return user;
    }

    async getProfile(userId: string) {
        const user = await this.findOne(userId);

        if (!user) {
            return null;
        }

        // Get user statistics
        const [totalReports, validReports, totalEarned] = await Promise.all([
            this.prisma.report.count({
                where: { researcherId: userId },
            }),
            this.prisma.report.count({
                where: {
                    researcherId: userId,
                    status: { in: ['ACCEPTED', 'RESOLVED', 'CLOSED'] },
                },
            }),
            this.prisma.payment.aggregate({
                where: {
                    researcherId: userId,
                    status: 'PAID',
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        return {
            ...user,
            stats: {
                totalReports,
                validReports,
                successRate: totalReports > 0 ? (validReports / totalReports) * 100 : 0,
                totalEarned: totalEarned._sum.amount || 0,
            },
        };
    }

    async updateProfile(userId: string, updateData: any) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: updateData.firstName,
                lastName: updateData.lastName,
                bio: updateData.bio,
                phoneNumber: updateData.phoneNumber,
                skills: updateData.skills,
                socialLinks: updateData.socialLinks,
                timezone: updateData.timezone,
                preferredLanguage: updateData.preferredLanguage,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                bio: true,
                profilePictureUrl: true,
                skills: true,
                socialLinks: true,
                timezone: true,
                preferredLanguage: true,
            },
        });

        return user;
    }

    async updateNotificationPreferences(userId: string, preferences: any) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                notificationPreferences: preferences,
                updatedAt: new Date(),
            },
        });

        return { message: 'Notification preferences updated', preferences: user.notificationPreferences };
    }

    async updatePrivacySettings(userId: string, settings: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        const currentPreferences = (user?.notificationPreferences as Record<string, any>) || {};

        const updatedPreferences = {
            ...currentPreferences,
            privacy: settings,
        };

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                notificationPreferences: updatedPreferences,
                updatedAt: new Date(),
            },
        });

        return { message: 'Privacy settings updated', settings };
    }

    async updatePreferences(userId: string, preferences: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        const currentPreferences = (user?.notificationPreferences as Record<string, any>) || {};

        const updatedPreferences = {
            ...currentPreferences,
            preferences,
        };

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                notificationPreferences: updatedPreferences,
                updatedAt: new Date(),
            },
        });

        return { message: 'Preferences updated', preferences };
    }

    async requestDataExport(userId: string) {
        // In production, this would queue a job to export user data
        // For now, return a success message
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        // TODO: Queue email with data export
        // Queue data export job
        return {
            message: 'Data export requested. Check your email within 24 hours.',
            requestedAt: new Date(),
        };
    }

    async requestDataDeletion(userId: string) {
        // In production, this would queue a job to delete user data
        // and send confirmation email
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        // TODO: Queue email with data deletion confirmation
        // Mark user for deletion or queue deletion job
        return {
            message: 'Data deletion requested. Your data will be deleted within 30 days.',
            requestedAt: new Date(),
        };
    }

    async getLeaderboard(limit: number = 10) {
        const cacheKey = `leaderboard:top${limit}`;

        // Try to get from cache first (15-minute TTL as per spec)
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }

        const topResearchers = await this.prisma.user.findMany({
            where: {
                role: 'RESEARCHER',
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
                reputationScore: true,
                totalEarnings: true,
                _count: {
                    select: {
                        reports: {
                            where: {
                                status: { in: ['ACCEPTED', 'RESOLVED', 'CLOSED'] },
                            },
                        },
                    },
                },
            },
            orderBy: {
                reputationScore: 'desc',
            },
            take: limit,
        });

        const leaderboard = topResearchers.map((researcher, index) => ({
            rank: index + 1,
            ...researcher,
            validReports: researcher._count.reports,
        }));

        // Cache for 15 minutes (900 seconds = 900000 milliseconds)
        await this.cacheManager.set(cacheKey, leaderboard, 900000);

        return leaderboard;
    }
}
