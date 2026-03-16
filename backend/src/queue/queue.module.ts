// ============================================
// Queue Module — Producer Only (API Side)
// Processors run in the standalone Worker container
// ============================================
import { Module, Global, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                const logger = new Logger('QueueModule');
                logger.log('Initializing Bull queues (producer-only)...');
                return {
                    connection: {
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: parseInt(configService.get('REDIS_PORT') || '6379'),
                        password: configService.get('REDIS_PASSWORD') || undefined,
                        retryStrategy: (times: number) => {
                            const delay = Math.min(times * 50, 2000);
                            return delay;
                        },
                    },
                };
            },
            inject: [ConfigService],
        }),
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
    ],
    exports: [BullModule],
})
export class QueueModule { }
