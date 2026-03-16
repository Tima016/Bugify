import { Test, TestingModule } from '@nestjs/testing';
import { ProgramsService } from './programs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProgramsService', () => {
    let service: ProgramsService;
    let prisma: PrismaService;

    const mockPrisma = {
        program: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProgramsService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<ProgramsService>(ProgramsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return an array of programs', async () => {
            const mockPrograms = [
                { id: '1', programName: 'Test Program', status: 'ACTIVE' },
                { id: '2', programName: 'Another Program', status: 'ACTIVE' },
            ];

            mockPrisma.program.findMany.mockResolvedValue(mockPrograms);

            const result = await service.findAll();

            expect(result).toEqual(mockPrograms);
            expect(mockPrisma.program.findMany).toHaveBeenCalledTimes(1);
        });

        it('should filter by status', async () => {
            const mockPrograms = [
                { id: '1', programName: 'Active Program', status: 'ACTIVE' },
            ];

            mockPrisma.program.findMany.mockResolvedValue(mockPrograms);

            await service.findAll({ status: 'ACTIVE' });

            expect(mockPrisma.program.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'ACTIVE' },
                })
            );
        });
    });

    describe('findOne', () => {
        it('should return a single program', async () => {
            const mockProgram = { id: '1', programName: 'Test Program' };

            mockPrisma.program.findUnique.mockResolvedValue(mockProgram);

            const result = await service.findOne('test-program');

            expect(result).toEqual(mockProgram);
            expect(mockPrisma.program.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { slug: 'test-program' },
                })
            );
        });

        it('should return null if program not found', async () => {
            mockPrisma.program.findUnique.mockResolvedValue(null);

            const result = await service.findOne('999');
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new program', async () => {
            const createDto = {
                programName: 'New Program',
                description: 'Test description',
                companyId: 'company-1',
            };

            const mockProgram = { id: '1', ...createDto, slug: 'new-program' };

            mockPrisma.program.create.mockResolvedValue(mockProgram);

            const result = await service.create('company-1', createDto);

            expect(result).toEqual(mockProgram);
            expect(mockPrisma.program.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        ...createDto,
                        companyId: 'company-1',
                        slug: 'new-program',
                    }),
                })
            );
        });
    });

    describe('update', () => {
        it('should update a program', async () => {
            const updateDto = { programName: 'Updated Name' };
            const mockProgram = { id: '1', programName: 'Updated Name', companyId: 'company-1' };

            // Two passes: first findUnique to verify ownership, then update
            mockPrisma.program.findUnique.mockResolvedValue(mockProgram);
            mockPrisma.program.update.mockResolvedValue(mockProgram);

            const result = await service.update('1', 'company-1', updateDto);

            expect(result).toEqual(mockProgram);
            expect(mockPrisma.program.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateDto,
            });
        });
    });

    describe('delete', () => {
        it('should delete a program', async () => {
            const mockProgram = { id: '1', programName: 'Deleted Program', companyId: 'company-1' };

            mockPrisma.program.findUnique.mockResolvedValue(mockProgram);
            mockPrisma.program.delete.mockResolvedValue(mockProgram);

            const result = await service.delete('1', 'company-1');

            expect(result).toEqual(mockProgram);
            expect(mockPrisma.program.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });
    });
});
