import { Test, TestingModule } from '@nestjs/testing';
import { UzPaymentService } from './uz-payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('UzPaymentService', () => {
    let service: UzPaymentService;
    let prisma: PrismaService;

    const mockPrisma = {
        payment: {
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
    };

    const mockConfig = {
        get: jest.fn((key: string) => {
            const config = {
                UZCARD_MERCHANT_ID: 'test-merchant',
                UZCARD_SECRET_KEY: 'test-secret',
                HUMO_MERCHANT_ID: 'humo-merchant',
                HUMO_SECRET_KEY: 'humo-secret',
                FRONTEND_URL: 'http://localhost:3000',
            };
            return config[key];
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UzPaymentService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfig,
                },
            ],
        }).compile();

        service = module.get<UzPaymentService>(UzPaymentService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initiateUzCardPayment', () => {
        it('should initiate UzCard payment', async () => {
            const paymentRequest = {
                amount: 50000,
                currency: 'UZS',
                description: 'Test payment',
                userId: 'user-1',
                provider: 'UZCARD',
            };

            const mockPayment = {
                id: 'payment-1',
                userId: 'user-1',
                amount: 50000,
                currency: 'UZS',
                description: 'Test payment',
                status: 'PENDING',
                provider: 'UZCARD',
            };

            mockPrisma.payment.create.mockResolvedValue(mockPayment);
            mockPrisma.payment.update.mockResolvedValue({
                ...mockPayment,
                status: 'PROCESSING',
                transactionId: 'UZCARD_123',
            });

            const result = await service.initiateUzCardPayment(paymentRequest as any);

            expect(result.status).toBeDefined();
            expect(mockPrisma.payment.create).toHaveBeenCalled();
        });
    });

    describe('initiateHumoPayment', () => {
        it('should initiate Humo payment', async () => {
            const paymentRequest = {
                amount: 100000,
                currency: 'UZS',
                description: 'Humo payment',
                userId: 'user-2',
                provider: 'HUMO',
            };

            const mockPayment = {
                id: 'payment-2',
                userId: 'user-2',
                amount: 100000,
                currency: 'UZS',
                description: 'Humo payment',
                status: 'PENDING',
                provider: 'HUMO',
            };

            mockPrisma.payment.create.mockResolvedValue(mockPayment);
            mockPrisma.payment.update.mockResolvedValue({
                ...mockPayment,
                status: 'PROCESSING',
                transactionId: 'HUMO_456',
            });

            const result = await service.initiateHumoPayment(paymentRequest as any);

            expect(result.status).toBeDefined();
            expect(mockPrisma.payment.create).toHaveBeenCalled();
        });
    });

    describe('handlePaymentCallback', () => {
        it('should handle successful payment callback', async () => {
            const callbackData = {
                transaction_id: 'UZCARD_123',
                status: 'success',
                merchant_id: 'test-merchant',
                amount: 50000,
                order_id: 'payment-1',
                signature: 'valid-signature',
            };

            mockPrisma.payment.findFirst.mockResolvedValue({
                id: 'payment-1',
                transactionId: 'UZCARD_123',
                status: 'PROCESSING',
            });

            mockPrisma.payment.update.mockResolvedValue({
                id: 'payment-1',
                status: 'COMPLETED',
            });

            const result = await service.handlePaymentCallback('UZCARD' as any, callbackData);

            expect(result.success).toBe(true);
        });
    });

    describe('getPaymentStatus', () => {
        it('should return payment status', async () => {
            const mockPayment = {
                id: 'payment-1',
                transactionId: 'UZCARD_123',
                status: 'COMPLETED',
                amount: 50000,
            };

            mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);

            const result = await service.getPaymentStatus('UZCARD_123');

            expect(result).toEqual(mockPayment);
        });
    });
});
