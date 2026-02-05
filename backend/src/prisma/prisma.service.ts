import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
        console.log('✅ Database connection established');
        // Note: Connection pooling is configured via the database URL in .env
        // Recommended production settings: ?connection_limit=20&pool_timeout=0
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('❌ Database connection closed');
    }
}
