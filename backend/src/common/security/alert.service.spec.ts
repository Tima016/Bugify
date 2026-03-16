import { AlertService, AlertPayload } from './alert.service';

describe('AlertService', () => {
    let service: AlertService;
    let mockPrisma: any;
    let mockMetrics: any;
    let mockCache: any;
    let mockQueue: any;

    beforeEach(() => {
        mockPrisma = {
            securityAlert: {
                create: jest.fn().mockResolvedValue({ id: 'alert-1' }),
                findMany: jest.fn().mockResolvedValue([]),
                update: jest.fn().mockResolvedValue({ id: 'alert-1', status: 'RESOLVED' }),
            },
        };

        mockMetrics = {
            securityAlertsTotal: { inc: jest.fn() },
        };

        mockCache = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
        };

        mockQueue = {
            add: jest.fn().mockResolvedValue({ id: 'job-1' }),
        };

        service = new AlertService(
            mockPrisma as any,
            mockMetrics as any,
            mockCache,
            mockQueue,
        );
    });

    afterEach(() => jest.clearAllMocks());

    describe('fire', () => {
        const basePayload: AlertPayload = {
            category: 'BRUTEFORCE' as any,
            severity: 'HIGH' as any,
            title: 'Login brute force attempt',
            description: 'Multiple failed login attempts from 192.168.1.1',
            targetUserId: 'user-1',
            sourceIp: '192.168.1.1',
        };

        it('should create alert in database', async () => {
            const alertId = await service.fire(basePayload);
            expect(alertId).toBe('alert-1');
            expect(mockPrisma.securityAlert.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    category: 'BRUTEFORCE',
                    severity: 'HIGH',
                    title: 'Login brute force attempt',
                }),
            });
        });

        it('should queue alert for notification dispatch', async () => {
            await service.fire(basePayload);
            expect(mockQueue.add).toHaveBeenCalledWith(
                'dispatch-alert',
                expect.objectContaining({
                    alertId: 'alert-1',
                    category: 'BRUTEFORCE',
                    severity: 'HIGH',
                }),
                expect.objectContaining({
                    priority: 2, // HIGH = priority 2
                    attempts: 3,
                }),
            );
        });

        it('should set CRITICAL alerts to priority 1', async () => {
            await service.fire({ ...basePayload, severity: 'CRITICAL' as any });
            expect(mockQueue.add).toHaveBeenCalledWith(
                'dispatch-alert',
                expect.anything(),
                expect.objectContaining({ priority: 1 }),
            );
        });

        it('should increment Prometheus counter', async () => {
            await service.fire(basePayload);
            expect(mockMetrics.securityAlertsTotal.inc).toHaveBeenCalledWith({
                category: 'BRUTEFORCE',
                severity: 'HIGH',
            });
        });

        // Cooldown tests
        it('should suppress duplicate alerts within cooldown window', async () => {
            mockCache.get.mockResolvedValue('1'); // Cooldown already set
            const alertId = await service.fire({
                ...basePayload,
                cooldownKey: 'brute:192.168.1.1',
            });
            expect(alertId).toBeNull();
            expect(mockPrisma.securityAlert.create).not.toHaveBeenCalled();
        });

        it('should NOT suppress when cooldown expired', async () => {
            mockCache.get.mockResolvedValue(null); // No cooldown
            const alertId = await service.fire({
                ...basePayload,
                cooldownKey: 'brute:192.168.1.1',
            });
            expect(alertId).toBe('alert-1');
            expect(mockCache.set).toHaveBeenCalledWith(
                'alert_cd:brute:192.168.1.1',
                '1',
                expect.any(Number),
            );
        });

        it('should NEVER suppress CRITICAL alerts regardless of cooldown', async () => {
            mockCache.get.mockResolvedValue('1'); // Cooldown set
            const alertId = await service.fire({
                ...basePayload,
                severity: 'CRITICAL' as any,
                cooldownKey: 'critical:wallet',
            });
            // CRITICAL alerts bypass cooldown
            expect(alertId).toBe('alert-1');
            expect(mockPrisma.securityAlert.create).toHaveBeenCalled();
        });
    });

    describe('getOpenAlerts', () => {
        it('should query open alerts with filters', async () => {
            await service.getOpenAlerts({ severity: 'HIGH' as any, limit: 10 });
            expect(mockPrisma.securityAlert.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: 'OPEN',
                        severity: 'HIGH',
                    }),
                    take: 10,
                }),
            );
        });
    });

    describe('resolve', () => {
        it('should update alert status to RESOLVED', async () => {
            await service.resolve('alert-1', 'admin-1');
            expect(mockPrisma.securityAlert.update).toHaveBeenCalledWith({
                where: { id: 'alert-1' },
                data: expect.objectContaining({
                    status: 'RESOLVED',
                    resolvedBy: 'admin-1',
                }),
            });
        });

        it('should support FALSE_POSITIVE status', async () => {
            await service.resolve('alert-1', 'admin-1', 'FALSE_POSITIVE');
            expect(mockPrisma.securityAlert.update).toHaveBeenCalledWith({
                where: { id: 'alert-1' },
                data: expect.objectContaining({ status: 'FALSE_POSITIVE' }),
            });
        });
    });
});
