import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhooks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhookService', () => {
    let service: WebhookService;
    let prisma: PrismaService;

    const mockPrisma = {
        webhook: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        webhookLog: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<WebhookService>(WebhookService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerWebhook', () => {
        it('should register a new webhook', async () => {
            const webhookData = {
                url: 'https://example.com/webhook',
                events: ['report.created', 'payment.completed'],
                userId: 'user-1',
            };

            const mockWebhook = {
                id: 'webhook-1',
                ...webhookData,
                secret: 'generated-secret',
                isActive: true,
            };

            mockPrisma.webhook.create.mockResolvedValue(mockWebhook);

            const result = await service.registerWebhook(webhookData);

            expect(result.id).toBe('webhook-1');
            expect(result.secret).toBeDefined();
            expect(mockPrisma.webhook.create).toHaveBeenCalled();
        });
    });

    describe('triggerWebhook', () => {
        it('should trigger webhooks for event', async () => {
            const mockWebhooks = [
                {
                    id: 'webhook-1',
                    url: 'https://example.com/webhook',
                    events: ['report.created'],
                    secret: 'secret-1',
                    isActive: true,
                },
            ];

            mockPrisma.webhook.findMany.mockResolvedValue(mockWebhooks);
            mockPrisma.webhookLog.create.mockResolvedValue({});
            mockPrisma.webhook.update.mockResolvedValue({});

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
            });

            await service.triggerWebhook('report.created', { reportId: '123' });

            expect(mockPrisma.webhook.findMany).toHaveBeenCalledWith({
                where: {
                    isActive: true,
                    events: { has: 'report.created' },
                },
            });
        });
    });

    describe('getWebhookLogs', () => {
        it('should return webhook logs', async () => {
            const mockLogs = [
                {
                    id: 'log-1',
                    webhookId: 'webhook-1',
                    event: 'report.created',
                    success: true,
                },
            ];

            mockPrisma.webhookLog.findMany.mockResolvedValue(mockLogs);

            const result = await service.getWebhookLogs('webhook-1');

            expect(result).toEqual(mockLogs);
            expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith({
                where: { webhookId: 'webhook-1' },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        });
    });
});
