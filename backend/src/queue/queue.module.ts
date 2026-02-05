import { Module, Global, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                const logger = new Logger('QueueModule');
                logger.log('Initializing Bull queues with Redis connection...');
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
        ),
    ],
    exports: [BullModule],
})
export class QueueModule { }
