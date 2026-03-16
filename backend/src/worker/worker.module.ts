// ============================================
// Worker Module
// Imports only what processors need — no HTTP controllers
// ============================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';
import { SecurityModule } from '../common/security/security.module';
import { MetricsModule } from '../common/metrics/metrics.module';
import { EmailProcessor } from '../queue/processors/email.processor';
import { MalwareScanProcessor } from '../queue/processors/malware-scan.processor';
import { AlertProcessor } from '../queue/processors/alert.processor';
import { EscrowReconciliationProcessor } from '../queue/processors/escrow-reconciliation.processor';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        // In-memory cache for cooldowns (AlertService dependency)
        CacheModule.register({ isGlobal: true }),

        // BullMQ connection (same Redis as API)
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get('REDIS_HOST') || 'localhost',
                    port: parseInt(configService.get('REDIS_PORT') || '6379'),
                    password: configService.get('REDIS_PASSWORD') || undefined,
                },
            }),
            inject: [ConfigService],
        }),

        // Register queues that this worker consumes
        BullModule.registerQueue(
            { name: 'email' },
            { name: 'notifications' },
            { name: 'payments' },
            { name: 'achievements' },
            { name: 'webhooks' },
            { name: 'malware-scan' },
            { name: 'alerts' },
            { name: 'scheduled-jobs' },
        ),

        // Infrastructure modules needed by processors
        PrismaModule,
        RedisModule,
        EmailModule,
        SecurityModule,
        MetricsModule,
    ],
    providers: [
        // Register all job processors here
        EmailProcessor,
        MalwareScanProcessor,
        AlertProcessor,
        EscrowReconciliationProcessor,
    ],
})
export class WorkerModule { }
