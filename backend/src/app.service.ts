import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  getHello(): string {
    return 'UzSecure Bug Bounty Platform API';
  }

  async getPlatformStats() {
    const cacheKey = 'platform:stats';

    // Try to get from cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get real statistics from database
    const [
      totalBountiesPaid,
      activePrograms,
      totalResearchers,
      vulnerabilitiesFixed,
    ] = await Promise.all([
      // Total bounties paid (sum of all paid payments)
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      // Active programs count
      this.prisma.program.count({
        where: { status: 'ACTIVE' },
      }),
      // Total researchers count
      this.prisma.user.count({
        where: { role: 'RESEARCHER' },
      }),
      // Vulnerabilities fixed (resolved reports)
      this.prisma.report.count({
        where: { status: 'RESOLVED' },
      }),
    ]);

    const stats = {
      totalBountiesPaid: totalBountiesPaid._sum.amount || 0,
      activePrograms,
      totalResearchers,
      vulnerabilitiesFixed,
    };

    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, stats, 300000);

    return stats;
  }
}
