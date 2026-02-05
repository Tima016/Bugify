import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService, AchievementType } from './achievements.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AchievementsService', () => {
    let service: AchievementsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AchievementsService,
                {
                    provide: PrismaService,
                    useValue: {
                        achievement: {
                            create: jest.fn(),
                            findFirst: jest.fn(),
                            findMany: jest.fn(),
                            count: jest.fn(),
                        },
                        notification: {
                            create: jest.fn(),
                        },
                        user: {
                            findUnique: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<AchievementsService>(AchievementsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('awardAchievement', () => {
        it('should award a new achievement', async () => {
            const mockAchievement = {
                id: '1',
                userId: 'user1',
                type: AchievementType.FIRST_BLOOD,
                title: 'First Blood',
                description: 'Submitted your first accepted vulnerability report',
                iconUrl: '/achievements/first-blood.svg',
                earnedAt: new Date(),
                metadata: null,
            };

            jest.spyOn(prisma.achievement, 'findFirst').mockResolvedValue(null);
            jest.spyOn(prisma.achievement, 'create').mockResolvedValue(mockAchievement as any);
            jest.spyOn(prisma.notification, 'create').mockResolvedValue({} as any);

            const result = await service.awardAchievement('user1', AchievementType.FIRST_BLOOD);

            expect(result).toEqual(mockAchievement);
            expect(prisma.achievement.create).toHaveBeenCalled();
            expect(prisma.notification.create).toHaveBeenCalled();
        });

        it('should not award duplicate achievement', async () => {
            const existingAchievement = {
                id: '1',
                userId: 'user1',
                type: AchievementType.FIRST_BLOOD,
            };

            jest.spyOn(prisma.achievement, 'findFirst').mockResolvedValue(existingAchievement as any);

            const result = await service.awardAchievement('user1', AchievementType.FIRST_BLOOD);

            expect(result).toEqual(existingAchievement);
            expect(prisma.achievement.create).not.toHaveBeenCalled();
        });
    });

    describe('getAvailableAchievements', () => {
        it('should return all 12 achievements', () => {
            const achievements = service.getAvailableAchievements();

            expect(achievements).toHaveLength(12);
            expect(achievements[0]).toHaveProperty('type');
            expect(achievements[0]).toHaveProperty('title');
            expect(achievements[0]).toHaveProperty('description');
        });
    });
});
