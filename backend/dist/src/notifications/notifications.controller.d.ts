import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
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
}
