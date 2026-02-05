import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
        private notificationsService: NotificationsService,
    ) { }

    async create(userId: string, createCommentDto: CreateCommentDto) {
        const { reportId, content, parentCommentId, isInternal, attachments } = createCommentDto;

        // Check if report exists
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
            include: { researcher: true, program: true }
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        // Create comment
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

        // Send real-time update via socket
        this.notificationsGateway.broadcastActivity({
            type: 'comment_added',
            reportId: reportId,
            comment: comment,
        });

        // Notify relevant parties persistently
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

    async findAllByReport(reportId: string, user: any) {
        // If user is researcher, filter out internal comments
        const whereClause: any = { reportId };

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

        // Return only top-level comments with their replies nested (or flat based on preference)
        // Here we return all, let frontend handle threading or return only root comments
        return comments.filter(c => !c.parentCommentId);
    }

    async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.userId !== userId) {
            throw new ForbiddenException('You can only edit your own comments');
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

    async remove(id: string, userId: string, userRole: string) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // Allow deletion if owner OR admin/moderator
        if (comment.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
            throw new ForbiddenException('You cannot delete this comment');
        }

        // Soft delete
        return this.prisma.comment.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
