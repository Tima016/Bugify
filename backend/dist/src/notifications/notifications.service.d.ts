import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private prisma;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsGateway: NotificationsGateway);
    create(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        link?: string;
        metadata?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        priority: import(".prisma/client").$Enums.NotificationPriority;
        link: string | null;
        message: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        sentViaEmail: boolean;
        sentViaSms: boolean;
    }>;
    findAll(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: string;
            title: string;
            priority: import(".prisma/client").$Enums.NotificationPriority;
            link: string | null;
            message: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
            isRead: boolean;
            readAt: Date | null;
            channel: import(".prisma/client").$Enums.NotificationChannel;
            sentViaEmail: boolean;
            sentViaSms: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        priority: import(".prisma/client").$Enums.NotificationPriority;
        link: string | null;
        message: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        sentViaEmail: boolean;
        sentViaSms: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
