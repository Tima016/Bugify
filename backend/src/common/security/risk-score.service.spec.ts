import { RiskScoreService } from './risk-score.service';

describe('RiskScoreService', () => {
    let service: RiskScoreService;
    let mockPrisma: any;
    let mockAlertService: any;
    let mockMetricsService: any;

    beforeEach(() => {
        mockPrisma = {
            securityAlert: { findMany: jest.fn() },
            user: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            auditLog: { create: jest.fn() },
        };

        mockAlertService = {
            fire: jest.fn().mockResolvedValue('alert-id'),
        };

        mockMetricsService = {
            userRiskScoreGauge: { set: jest.fn() },
        };

        service = new RiskScoreService(
            mockPrisma as any,
            mockAlertService as any,
            mockMetricsService as any,
        );
    });

    afterEach(() => jest.clearAllMocks());

    describe('recalculate', () => {
        it('should return score 0 (LOW) when no alerts exist', async () => {
            mockPrisma.securityAlert.findMany.mockResolvedValue([]);
            mockPrisma.user.findUnique.mockResolvedValue({
                riskOverrideAt: null,
                riskLevel: 'LOW',
            });
            mockPrisma.user.update.mockResolvedValue({});

            const score = await service.recalculate('user-1');
            expect(score).toBe(0);
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ riskScore: 0, riskLevel: 'LOW' }),
                }),
            );
        });

        it('should calculate MEDIUM (30-59) from moderate alerts', async () => {
            mockPrisma.securityAlert.findMany.mockResolvedValue([
                { category: 'MULTI_ACCOUNT' },  // 15
                { category: 'FAKE_FARMING' },    // 10
                { category: 'BRUTEFORCE' },      // 5
            ]);
            mockPrisma.user.findUnique.mockResolvedValue({
                riskOverrideAt: null,
                riskLevel: 'LOW',
            });
            mockPrisma.user.update.mockResolvedValue({});

            const score = await service.recalculate('user-1');
            expect(score).toBe(30); // 15 + 10 + 5
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ riskLevel: 'MEDIUM' }),
                }),
            );
        });

        it('should cap category multiplier at 2x', async () => {
            // 3 MULTI_ACCOUNT alerts should only count 2x (not 3x)
            mockPrisma.securityAlert.findMany.mockResolvedValue([
                { category: 'MULTI_ACCOUNT' },
                { category: 'MULTI_ACCOUNT' },
                { category: 'MULTI_ACCOUNT' },
            ]);
            mockPrisma.user.findUnique.mockResolvedValue({
                riskOverrideAt: null,
                riskLevel: 'LOW',
            });
            mockPrisma.user.update.mockResolvedValue({});

            const score = await service.recalculate('user-1');
            expect(score).toBe(30); // 15 * 2 = 30 (capped at 2x, not 3x)
        });

        it('should auto-ban at CRITICAL threshold (score >= 80)', async () => {
            mockPrisma.securityAlert.findMany.mockResolvedValue([
                { category: 'PAYMENT_FRAUD' },   // 20
                { category: 'PAYMENT_FRAUD' },   // 20 (2x = 40)
                { category: 'INSIDER_THREAT' },  // 20
                { category: 'INSIDER_THREAT' },  // 20 (2x = 40)
            ]);
            mockPrisma.user.findUnique.mockResolvedValue({
                riskOverrideAt: null,
                riskLevel: 'LOW',
            });
            mockPrisma.user.update.mockResolvedValue({});

            const score = await service.recalculate('user-1');
            expect(score).toBe(80);
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        isBanned: true,
                        riskLevel: 'CRITICAL',
                    }),
                }),
            );
            expect(mockAlertService.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: 'SYSTEM',
                    severity: 'CRITICAL',
                    title: expect.stringContaining('auto-suspended'),
                }),
            );
        });

        it('should respect admin override and NOT auto-ban', async () => {
            mockPrisma.securityAlert.findMany.mockResolvedValue([
                { category: 'PAYMENT_FRAUD' },
                { category: 'PAYMENT_FRAUD' },
                { category: 'INSIDER_THREAT' },
                { category: 'INSIDER_THREAT' },
            ]);
            // Override is within 30 days
            mockPrisma.user.findUnique.mockResolvedValue({
                riskOverrideAt: new Date(),
                riskLevel: 'LOW',
            });
            mockPrisma.user.update.mockResolvedValue({});

            const score = await service.recalculate('user-1');
            expect(score).toBe(80);
            // Should preserve overridden level
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ riskLevel: 'LOW' }),
                }),
            );
            // Should NOT auto-ban
            expect(mockAlertService.fire).not.toHaveBeenCalled();
        });

        it('should cap score at 100', async () => {
            // Generate enough alerts to exceed 100
            mockPrisma.securityAlert.findMany.mockResolvedValue([
                { category: 'PAYMENT_FRAUD' },
                { category: 'PAYMENT_FRAUD' },
                { category: 'INSIDER_THREAT' },
                { category: 'INSIDER_THREAT' },
                { category: 'MULTI_ACCOUNT' },
                { category: 'MULTI_ACCOUNT' },
            ]);
            mockPrisma.user.findUnique.mockResolvedValue({
                riskOverrideAt: null,
                riskLevel: 'LOW',
            });
            mockPrisma.user.update.mockResolvedValue({});

            const score = await service.recalculate('user-1');
            expect(score).toBeLessThanOrEqual(100);
        });

        it('should update Prometheus gauge', async () => {
            mockPrisma.securityAlert.findMany.mockResolvedValue([]);
            mockPrisma.user.findUnique.mockResolvedValue({
                riskOverrideAt: null,
                riskLevel: 'LOW',
            });
            mockPrisma.user.update.mockResolvedValue({});

            await service.recalculate('user-1');
            expect(mockMetricsService.userRiskScoreGauge.set).toHaveBeenCalledWith(
                { level: 'LOW' },
                0,
            );
        });
    });

    describe('adminOverride', () => {
        it('should update user risk level and clear ban', async () => {
            mockPrisma.user.update.mockResolvedValue({});
            mockPrisma.auditLog.create.mockResolvedValue({});

            await service.adminOverride('user-1', 'admin-1', 'LOW');

            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        riskLevel: 'LOW',
                        riskOverrideBy: 'admin-1',
                        isBanned: false,
                        riskLockedAt: null,
                    }),
                }),
            );
        });

        it('should create audit log entry', async () => {
            mockPrisma.user.update.mockResolvedValue({});
            mockPrisma.auditLog.create.mockResolvedValue({});

            await service.adminOverride('user-1', 'admin-1', 'LOW');

            expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        action: 'ADMIN_RISK_OVERRIDE',
                        userId: 'admin-1',
                        resourceId: 'user-1',
                    }),
                }),
            );
        });
    });
});
