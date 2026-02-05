import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Program, Report, User, PlatformStats, LeaderboardEntry } from './types';
import { PrismaService } from '../prisma/prisma.service';
import { AppService } from '../app.service';
import { UsersService } from '../users/users.service';

@Resolver(() => Program)
export class ProgramResolver {
    constructor(private prisma: PrismaService) { }

    @Query(() => [Program])
    async programs(
        @Args('status', { nullable: true }) status?: string,
        @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    ) {
        return this.prisma.program.findMany({
            where: status ? { status: status as any } : undefined,
            take: limit || 20,
            orderBy: { createdAt: 'desc' },
        });
    }

    @Query(() => Program, { nullable: true })
    async program(@Args('id') id: string) {
        return this.prisma.program.findUnique({
            where: { id },
        });
    }
}

@Resolver(() => Report)
export class ReportResolver {
    constructor(private prisma: PrismaService) { }

    @Query(() => [Report])
    async reports(
        @Args('programId', { nullable: true }) programId?: string,
        @Args('status', { nullable: true }) status?: string,
        @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    ) {
        return this.prisma.report.findMany({
            where: {
                ...(programId && { programId }),
                ...(status && { status: status as any }),
            },
            take: limit || 20,
            orderBy: { createdAt: 'desc' },
        });
    }

    @Query(() => Report, { nullable: true })
    async report(@Args('id') id: string) {
        return this.prisma.report.findUnique({
            where: { id },
        });
    }
}

@Resolver(() => User)
export class UserResolver {
    constructor(private prisma: PrismaService) { }

    @Query(() => User, { nullable: true })
    async user(@Args('id') id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                reputationScore: true,
                totalEarnings: true,
                isVerified: true,
                createdAt: true,
            },
        });
    }
}

@Resolver()
export class StatsResolver {
    constructor(
        private appService: AppService,
        private usersService: UsersService,
    ) { }

    @Query(() => PlatformStats)
    async platformStats() {
        return this.appService.getPlatformStats();
    }

    @Query(() => [LeaderboardEntry])
    async leaderboard(
        @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    ) {
        return this.usersService.getLeaderboard(limit || 10);
    }
}
