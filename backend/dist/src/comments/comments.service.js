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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
let CommentsService = class CommentsService {
    prisma;
    notificationsGateway;
    notificationsService;
    constructor(prisma, notificationsGateway, notificationsService) {
        this.prisma = prisma;
        this.notificationsGateway = notificationsGateway;
        this.notificationsService = notificationsService;
    }
    async create(userId, createCommentDto) {
        const { reportId, content, parentCommentId, isInternal, attachments } = createCommentDto;
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
            include: { researcher: true, program: true }
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        const comment = await this.prisma.comment.create({
            data: {
                reportId,
                userId,
                content,
                parentCommentId,
                isInternal: isInternal || false,
                attachments: attachments || [],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilePictureUrl: true,
                        role: true,
                    }
                }
            }
        });
        this.notificationsGateway.broadcastActivity({
            type: 'comment_added',
            reportId: reportId,
            comment: comment,
        });
        if (!isInternal && comment.userId !== report.researcherId) {
            await this.notificationsService.create({
                userId: report.researcherId,
                type: 'COMMENT',
                title: 'New Comment',
                message: `New comment on report #${report.reportNumber}`,
                link: `/dashboard/reports/${report.id}`,
                metadata: { reportId: report.id, commentId: comment.id }
            });
        }
        return comment;
    }
    async findAllByReport(reportId, user) {
        const whereClause = { reportId };
        if (user.role === 'RESEARCHER') {
            whereClause.isInternal = false;
        }
        const comments = await this.prisma.comment.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilePictureUrl: true,
                        role: true,
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profilePictureUrl: true,
                                role: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
        });
        return comments.filter(c => !c.parentCommentId);
    }
    async update(id, userId, updateCommentDto) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own comments');
        }
        return this.prisma.comment.update({
            where: { id },
            data: {
                content: updateCommentDto.content,
                edited: true,
                editedAt: new Date(),
            }
        });
    }
    async remove(id, userId, userRole) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
            throw new common_1.ForbiddenException('You cannot delete this comment');
        }
        return this.prisma.comment.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway,
        notifications_service_1.NotificationsService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map