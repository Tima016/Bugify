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
                { id: '1', name: 'Test Program', status: 'ACTIVE' },
                { id: '2', name: 'Another Program', status: 'ACTIVE' },
            ];

            mockPrisma.program.findMany.mockResolvedValue(mockPrograms);

            const result = await service.findAll();

            expect(result).toEqual(mockPrograms);
            expect(mockPrisma.program.findMany).toHaveBeenCalledTimes(1);
        });

        it('should filter by status', async () => {
            const mockPrograms = [
                { id: '1', name: 'Active Program', status: 'ACTIVE' },
            ];

            mockPrisma.program.findMany.mockResolvedValue(mockPrograms);

            await service.findAll({ status: 'ACTIVE' });

            expect(mockPrisma.program.findMany).toHaveBeenCalledWith({
                where: { status: 'ACTIVE' },
            });
        });
    });

    describe('findOne', () => {
        it('should return a single program', async () => {
            const mockProgram = { id: '1', name: 'Test Program' };

            mockPrisma.program.findUnique.mockResolvedValue(mockProgram);

            const result = await service.findOne('1');

            expect(result).toEqual(mockProgram);
            expect(mockPrisma.program.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });

        it('should throw error if program not found', async () => {
            mockPrisma.program.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow();
        });
    });

    describe('create', () => {
        it('should create a new program', async () => {
            const createDto = {
                name: 'New Program',
                description: 'Test description',
                companyId: 'company-1',
            };

            const mockProgram = { id: '1', ...createDto };

            mockPrisma.program.create.mockResolvedValue(mockProgram);

            const result = await service.create(createDto);

            expect(result).toEqual(mockProgram);
            expect(mockPrisma.program.create).toHaveBeenCalledWith({
                data: createDto,
            });
        });
    });

    describe('update', () => {
        it('should update a program', async () => {
            const updateDto = { name: 'Updated Name' };
            const mockProgram = { id: '1', name: 'Updated Name' };

            mockPrisma.program.update.mockResolvedValue(mockProgram);

            const result = await service.update('1', updateDto);

            expect(result).toEqual(mockProgram);
            expect(mockPrisma.program.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateDto,
            });
        });
    });

    describe('delete', () => {
        it('should delete a program', async () => {
            const mockProgram = { id: '1', name: 'Deleted Program' };

            mockPrisma.program.delete.mockResolvedValue(mockProgram);

            const result = await service.delete('1');

            expect(result).toEqual(mockProgram);
            expect(mockPrisma.program.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });
    });
});
