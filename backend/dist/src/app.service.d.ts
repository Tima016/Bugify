import type { Cache } from 'cache-manager';
import { PrismaService } from './prisma/prisma.service';
export declare class AppService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    getHello(): string;
    getPlatformStats(): Promise<{}>;
}
