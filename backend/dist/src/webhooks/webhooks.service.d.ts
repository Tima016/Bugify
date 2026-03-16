import { PrismaService } from '../prisma/prisma.service';
export declare class WebhookService {
    private prisma;
    constructor(prisma: PrismaService);
    registerWebhook(data: {
        url: string;
        events: string[];
        userId: string;
        secret?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        userId: string;
        isActive: boolean;
        events: string[];
        secret: string;
    }>;
    triggerWebhook(event: string, payload: any): Promise<void>;
    private sendWebhook;
    private generateSecret;
    private generateSignature;
    retryFailedWebhooks(): Promise<void>;
    getWebhookLogs(webhookId: string, limit?: number): Promise<{
        error: string | null;
        id: string;
        event: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        response: import("@prisma/client/runtime/library").JsonValue | null;
        statusCode: number | null;
        success: boolean;
        attemptedAt: Date;
        webhookId: string;
    }[]>;
    deleteWebhook(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        userId: string;
        isActive: boolean;
        events: string[];
        secret: string;
    }>;
}
