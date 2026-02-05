"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                useFactory: (configService) => {
                    const logger = new common_1.Logger('QueueModule');
                    logger.log('Initializing Bull queues with Redis connection...');
                    return {
                        connection: {
                            host: configService.get('REDIS_HOST') || 'localhost',
                            port: parseInt(configService.get('REDIS_PORT') || '6379'),
                            password: configService.get('REDIS_PASSWORD') || undefined,
                            retryStrategy: (times) => {
                                const delay = Math.min(times * 50, 2000);
                                return delay;
                            },
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.registerQueue({ name: 'email' }, { name: 'notifications' }, { name: 'payments' }),
        ],
        exports: [bullmq_1.BullModule],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map