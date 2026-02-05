import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

describe('ReportsService', () => {
    let service: ReportsService;
    let prisma: PrismaService;
    let aiService: AIService;

    const mockPrisma = {
        report: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    const mockAIService = {
        detectDuplicates: jest.fn(),
        classifyReportSeverity: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
                {
                    provide: AIService,
                    useValue: mockAIService,
                },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
        prisma = module.get<PrismaService>(PrismaService);
        aiService = module.get<AIService>(AIService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new report', async () => {
            const createDto = {
                title: 'XSS Vulnerability',
                description: 'Found XSS',
                programId: 'prog-1',
                researcherId: 'user-1',
                severity: 'HIGH',
                vulnerabilityType: 'XSS',
                impactAnalysis: 'Critical impact',
                reproductionSteps: 'Step 1...',
                discoveredDate: new Date().toISOString(),
            };

            const mockReport = { id: '1', ...createDto };

            mockPrisma.report.create.mockResolvedValue(mockReport);
            mockAIService.detectDuplicates.mockResolvedValue({
                isDuplicate: false,
                similarReports: [],
                confidence: 0,
            });

            const result = await service.create('user-1', createDto);

            expect(result).toEqual(mockReport);
            expect(mockPrisma.report.create).toHaveBeenCalled();
        });

        it('should detect duplicate reports', async () => {
            const createDto = {
                title: 'SQL Injection',
                description: 'SQL injection found',
                programId: 'prog-1',
                researcherId: 'user-1',
                vulnerabilityType: 'SQLi',
                impactAnalysis: 'Critical',
                reproductionSteps: 'Steps...',
                discoveredDate: new Date(),
                severity: 'CRITICAL',
            };

            mockPrisma.report.create.mockResolvedValue({ id: '1', ...createDto });
            mockAIService.detectDuplicates.mockResolvedValue({
                isDuplicate: true,
                similarReports: [{ id: '2', title: 'SQL Injection' }],
                confidence: 0.9,
            });

            const result = await service.create('user-1', createDto);

            expect(mockAIService.detectDuplicates).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return reports', async () => {
            const mockReports = [
                { id: '1', title: 'Report 1' },
                { id: '2', title: 'Report 2' },
            ];

            mockPrisma.report.findMany.mockResolvedValue(mockReports);

            const result = await service.findAll({});

            expect(result).toEqual(mockReports);
        });

        it('should filter by severity', async () => {
            mockPrisma.report.findMany.mockResolvedValue([]);

            await service.findAll({ severity: 'CRITICAL' });

            expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ severity: 'CRITICAL' }),
                })
            );
        });
    });

    describe('updateStatus', () => {
        it('should update report status', async () => {
            const mockReport = { id: '1', status: 'ACCEPTED' };

            mockPrisma.report.update.mockResolvedValue(mockReport);
            // Mock transaction to just execute the callback
            mockPrisma.$transaction = jest.fn((callback) => callback(mockPrisma));

            // We need to mock findUnique for the report check inside updateStatus
            mockPrisma.report.findUnique.mockResolvedValue({
                id: '1',
                programId: 'prog-1',
                researcherId: 'user-1',
                status: 'SUBMITTED',
                submittedDate: new Date()
            });

            const result = await service.updateStatus('1', 'user-1', { status: 'ACCEPTED' });

            expect(result.status).toBe('ACCEPTED');
            expect(mockPrisma.report.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: '1' },
                    data: expect.objectContaining({ status: 'ACCEPTED' }),
                })
            );
        });
    });
});
