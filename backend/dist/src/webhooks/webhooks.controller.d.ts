import { WebhookService } from './webhooks.service';
export declare class WebhooksController {
    private webhookService;
    constructor(webhookService: WebhookService);
    registerWebhook(req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        userId: string;
        isActive: boolean;
        events: string[];
        secret: string;
    }>;
    getWebhookLogs(id: string): Promise<{
        error: string | null;
        id: string;
        success: boolean;
        webhookId: string;
        event: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        response: import("@prisma/client/runtime/library").JsonValue | null;
        statusCode: number | null;
        attemptedAt: Date;
    }[]>;
    deleteWebhook(id: string, req: any): Promise<{
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
