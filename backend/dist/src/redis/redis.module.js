"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => {
                    const logger = new common_1.Logger('RedisModule');
                    try {
                        const store = await (0, cache_manager_redis_yet_1.redisStore)({
                            socket: {
                                host: process.env.REDIS_HOST || 'localhost',
                                port: parseInt(process.env.REDIS_PORT || '6379'),
                            },
                            password: process.env.REDIS_PASSWORD || undefined,
                            ttl: 300,
                        });
                        logger.log('✓ Redis connected successfully');
                        return {
                            store: store,
                            ttl: 300000,
                        };
                    }
                    catch (error) {
                        logger.warn('⚠ Redis not available, using in-memory cache for development');
                        return {
                            ttl: 300000,
                        };
                    }
                },
            }),
        ],
        exports: [cache_manager_1.CacheModule],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map