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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async findOne(id) {
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
    async getProfile(userId) {
        const user = await this.findOne(userId);
        if (!user) {
            return null;
        }
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
    async updateProfile(userId, updateData) {
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
    async updateNotificationPreferences(userId, preferences) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                notificationPreferences: preferences,
                updatedAt: new Date(),
            },
        });
        return { message: 'Notification preferences updated', preferences: user.notificationPreferences };
    }
    async updatePrivacySettings(userId, settings) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const currentPreferences = user?.notificationPreferences || {};
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
    async updatePreferences(userId, preferences) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const currentPreferences = user?.notificationPreferences || {};
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
    async requestDataExport(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        return {
            message: 'Data export requested. Check your email within 24 hours.',
            requestedAt: new Date(),
        };
    }
    async requestDataDeletion(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        return {
            message: 'Data deletion requested. Your data will be deleted within 30 days.',
            requestedAt: new Date(),
        };
    }
    async getLeaderboard(limit = 10) {
        const cacheKey = `leaderboard:top${limit}`;
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
        await this.cacheManager.set(cacheKey, leaderboard, 900000);
        return leaderboard;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map