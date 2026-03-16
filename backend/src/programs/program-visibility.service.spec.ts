import { ProgramVisibilityService, AuthUser } from './program-visibility.service';
import { NotFoundException } from '@nestjs/common';

describe('ProgramVisibilityService', () => {
    let service: ProgramVisibilityService;
    let mockPrisma: any;

    const publicProgram = {
        id: 'prog-1',
        programType: 'PUBLIC',
        companyId: 'company-1',
        status: 'ACTIVE',
        deletedAt: null,
    };

    const privateProgram = {
        id: 'prog-2',
        programType: 'PRIVATE',
        companyId: 'company-1',
        status: 'ACTIVE',
        deletedAt: null,
    };

    beforeEach(() => {
        mockPrisma = {
            program: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
            },
            programInvite: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
            },
        };

        service = new ProgramVisibilityService(mockPrisma as any);
    });

    afterEach(() => jest.clearAllMocks());

    describe('assertAccess', () => {
        it('should throw NotFoundException when program does not exist', async () => {
            mockPrisma.program.findFirst.mockResolvedValue(null);
            const user: AuthUser = { id: 'user-1', role: 'RESEARCHER' };

            await expect(service.assertAccess('nonexistent', user))
                .rejects.toThrow(NotFoundException);
        });

        it('should allow SUPER_ADMIN access to any program', async () => {
            mockPrisma.program.findFirst.mockResolvedValue(privateProgram);
            const admin: AuthUser = { id: 'admin-1', role: 'SUPER_ADMIN' };

            const result = await service.assertAccess('prog-2', admin);
            expect(result).toEqual(privateProgram);
        });

        it('should allow COMPANY to access own programs', async () => {
            mockPrisma.program.findFirst.mockResolvedValue(publicProgram);
            const company: AuthUser = { id: 'cuser-1', role: 'COMPANY', companyId: 'company-1' };

            const result = await service.assertAccess('prog-1', company);
            expect(result).toEqual(publicProgram);
        });

        it('should return 404 (not 403) when COMPANY tries to access another company program', async () => {
            mockPrisma.program.findFirst.mockResolvedValue(publicProgram);
            const otherCompany: AuthUser = { id: 'cuser-2', role: 'COMPANY', companyId: 'company-2' };

            await expect(service.assertAccess('prog-1', otherCompany))
                .rejects.toThrow(NotFoundException);
        });

        it('should allow RESEARCHER access to PUBLIC programs', async () => {
            mockPrisma.program.findFirst.mockResolvedValue(publicProgram);
            const researcher: AuthUser = { id: 'user-1', role: 'RESEARCHER' };

            const result = await service.assertAccess('prog-1', researcher);
            expect(result).toEqual(publicProgram);
        });

        it('should allow RESEARCHER access to PRIVATE program with ACCEPTED invite', async () => {
            mockPrisma.program.findFirst.mockResolvedValue(privateProgram);
            mockPrisma.programInvite.findFirst.mockResolvedValue({
                id: 'invite-1',
                status: 'ACCEPTED',
                expiresAt: null,
            });

            const researcher: AuthUser = { id: 'user-1', role: 'RESEARCHER' };
            const result = await service.assertAccess('prog-2', researcher);
            expect(result).toEqual(privateProgram);
        });

        it('should return 404 when RESEARCHER has no invite for PRIVATE program (anti-enumeration)', async () => {
            mockPrisma.program.findFirst.mockResolvedValue(privateProgram);
            mockPrisma.programInvite.findFirst.mockResolvedValue(null);

            const researcher: AuthUser = { id: 'user-1', role: 'RESEARCHER' };
            await expect(service.assertAccess('prog-2', researcher))
                .rejects.toThrow(NotFoundException);
        });

        it('should deny expired invite for PRIVATE program', async () => {
            mockPrisma.program.findFirst.mockResolvedValue(privateProgram);
            // findFirst for invite returns null when expiresAt < now
            mockPrisma.programInvite.findFirst.mockResolvedValue(null);

            const researcher: AuthUser = { id: 'user-1', role: 'RESEARCHER' };
            await expect(service.assertAccess('prog-2', researcher))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('findVisiblePrograms', () => {
        it('should return all programs for SUPER_ADMIN', async () => {
            mockPrisma.program.findMany.mockResolvedValue([publicProgram, privateProgram]);
            const admin: AuthUser = { id: 'admin-1', role: 'SUPER_ADMIN' };

            const result = await service.findVisiblePrograms(admin);
            expect(result).toHaveLength(2);
        });

        it('should return only company-owned programs for COMPANY', async () => {
            mockPrisma.program.findMany.mockResolvedValue([publicProgram]);
            const company: AuthUser = { id: 'cuser-1', role: 'COMPANY', companyId: 'company-1' };

            await service.findVisiblePrograms(company);
            expect(mockPrisma.program.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ companyId: 'company-1' }),
                }),
            );
        });

        it('should return PUBLIC + invited PRIVATE programs for RESEARCHER', async () => {
            mockPrisma.programInvite.findMany.mockResolvedValue([
                { programId: 'prog-2' },
            ]);
            mockPrisma.program.findMany.mockResolvedValue([publicProgram, privateProgram]);

            const researcher: AuthUser = { id: 'user-1', role: 'RESEARCHER' };
            await service.findVisiblePrograms(researcher);

            expect(mockPrisma.program.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: [
                            { programType: 'PUBLIC' },
                            { id: { in: ['prog-2'] } },
                        ],
                    }),
                }),
            );
        });
    });

    describe('verifyActiveInvite', () => {
        it('should throw ForbiddenException when no active invite', async () => {
            mockPrisma.programInvite.findFirst.mockResolvedValue(null);

            await expect(service.verifyActiveInvite('prog-2', 'user-1'))
                .rejects.toThrow('No active invite for this program');
        });

        it('should pass when active invite exists', async () => {
            mockPrisma.programInvite.findFirst.mockResolvedValue({ id: 'invite-1' });

            await expect(service.verifyActiveInvite('prog-2', 'user-1'))
                .resolves.not.toThrow();
        });
    });
});
