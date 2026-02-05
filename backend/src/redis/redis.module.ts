import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => {
                const logger = new Logger('RedisModule');
                try {
                    const store = await redisStore({
                        socket: {
                            host: process.env.REDIS_HOST || 'localhost',
                            port: parseInt(process.env.REDIS_PORT || '6379'),
                        },
                        password: process.env.REDIS_PASSWORD || undefined,
                        ttl: 300, // Default TTL: 5 minutes (in seconds)
                    });

                    logger.log('✓ Redis connected successfully');
                    return {
                        store: store as any,
                        ttl: 300000, // 5 minutes in milliseconds
                    };
                } catch (error) {
                    logger.warn('⚠ Redis not available, using in-memory cache for development');
                    // Fallback to in-memory cache
                    return {
                        ttl: 300000, // 5 minutes in milliseconds
                    };
                }
            },
        }),
    ],
    exports: [CacheModule],
})
export class RedisModule { }
