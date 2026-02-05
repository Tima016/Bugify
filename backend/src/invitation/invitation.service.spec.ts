import { Test, TestingModule } from '@nestjs/testing';
import { InvitationService } from './invitation.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InvitationService', () => {
    let service: InvitationService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InvitationService,
                {
                    provide: PrismaService,
                    useValue: {
                        invitationCode: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            findMany: jest.fn(),
                            update: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<InvitationService>(InvitationService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createInvitation', () => {
        it('should create an invitation code', async () => {
            const mockInvitation = {
                id: '1',
                code: 'ABC123',
                companyId: 'company1',
                createdById: 'user1',
                email: null,
                role: 'RESEARCHER',
                maxUses: 1,
                usedCount: 0,
                expiresAt: null,
                isActive: true,
                createdAt: new Date(),
            };

            jest.spyOn(prisma.invitationCode, 'create').mockResolvedValue(mockInvitation as any);

            const result = await service.createInvitation('company1', 'user1', {});

            expect(result).toEqual(mockInvitation);
            expect(prisma.invitationCode.create).toHaveBeenCalled();
        });
    });

    describe('validateAndUseCode', () => {
        it('should throw error for invalid code', async () => {
            jest.spyOn(prisma.invitationCode, 'findUnique').mockResolvedValue(null);

            await expect(service.validateAndUseCode('INVALID')).rejects.toThrow('Invalid invitation code');
        });

        it('should throw error for inactive code', async () => {
            const mockInvitation = {
                id: '1',
                code: 'ABC123',
                isActive: false,
                expiresAt: null,
                usedCount: 0,
                maxUses: 1,
            };

            jest.spyOn(prisma.invitationCode, 'findUnique').mockResolvedValue(mockInvitation as any);

            await expect(service.validateAndUseCode('ABC123')).rejects.toThrow('no longer active');
        });
    });
});
