import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CommentsService {
    private prisma;
    private notificationsGateway;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsGateway: NotificationsGateway, notificationsService: NotificationsService);
    create(userId: string, createCommentDto: CreateCommentDto): Promise<{
        user: {
            id: string;
            username: string;
            profilePictureUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        attachments: import("@prisma/client/runtime/library").JsonValue | null;
        reportId: string;
        userId: string;
        content: string;
        parentCommentId: string | null;
        isInternal: boolean;
        visibility: import(".prisma/client").$Enums.CommentVisibility;
        edited: boolean;
        editedAt: Date | null;
        reactions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAllByReport(reportId: string, user: any): Promise<({
        user: {
            id: string;
            username: string;
            profilePictureUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
        replies: ({
            user: {
                id: string;
                username: string;
                profilePictureUrl: string | null;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            attachments: import("@prisma/client/runtime/library").JsonValue | null;
            reportId: string;
            userId: string;
            content: string;
            parentCommentId: string | null;
            isInternal: boolean;
            visibility: import(".prisma/client").$Enums.CommentVisibility;
            edited: boolean;
            editedAt: Date | null;
            reactions: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        attachments: import("@prisma/client/runtime/library").JsonValue | null;
        reportId: string;
        userId: string;
        content: string;
        parentCommentId: string | null;
        isInternal: boolean;
        visibility: import(".prisma/client").$Enums.CommentVisibility;
        edited: boolean;
        editedAt: Date | null;
        reactions: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    update(id: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        attachments: import("@prisma/client/runtime/library").JsonValue | null;
        reportId: string;
        userId: string;
        content: string;
        parentCommentId: string | null;
        isInternal: boolean;
        visibility: import(".prisma/client").$Enums.CommentVisibility;
        edited: boolean;
        editedAt: Date | null;
        reactions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        attachments: import("@prisma/client/runtime/library").JsonValue | null;
        reportId: string;
        userId: string;
        content: string;
        parentCommentId: string | null;
        isInternal: boolean;
        visibility: import(".prisma/client").$Enums.CommentVisibility;
        edited: boolean;
        editedAt: Date | null;
        reactions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
