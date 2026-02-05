import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        // use forwardRef if circular dependency arises, but hopefully module structure handles it
        @Inject(forwardRef(() => NotificationsGateway))
        private notificationsGateway: NotificationsGateway,
    ) { }

    async create(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        link?: string;
        metadata?: any;
    }) {
        // Save to DB
        const notification = await this.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link,
                metadata: data.metadata || {},
            },
        });

        // Emit real-time
        this.notificationsGateway.sendNotificationToUser(data.userId, notification);

        return notification;
    }

    async findAll(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total] = await this.prisma.$transaction([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        return {
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.prisma.notification.findUnique({ where: { id } });

        if (!notification || notification.userId !== userId) {
            throw new NotFoundException('Notification not found');
        }

        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
}
