"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const config_2 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_module_1 = require("../prisma/prisma.module");
const redis_module_1 = require("../redis/redis.module");
const email_module_1 = require("../email/email.module");
const security_module_1 = require("../common/security/security.module");
const metrics_module_1 = require("../common/metrics/metrics.module");
const email_processor_1 = require("../queue/processors/email.processor");
const malware_scan_processor_1 = require("../queue/processors/malware-scan.processor");
const alert_processor_1 = require("../queue/processors/alert.processor");
const escrow_reconciliation_processor_1 = require("../queue/processors/escrow-reconciliation.processor");
let WorkerModule = class WorkerModule {
};
exports.WorkerModule = WorkerModule;
exports.WorkerModule = WorkerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cache_manager_1.CacheModule.register({ isGlobal: true }),
            bullmq_1.BullModule.forRootAsync({
                useFactory: (configService) => ({
                    connection: {
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: parseInt(configService.get('REDIS_PORT') || '6379'),
                        password: configService.get('REDIS_PASSWORD') || undefined,
                    },
                }),
                inject: [config_2.ConfigService],
            }),
            bullmq_1.BullModule.registerQueue({ name: 'email' }, { name: 'notifications' }, { name: 'payments' }, { name: 'achievements' }, { name: 'webhooks' }, { name: 'malware-scan' }, { name: 'alerts' }, { name: 'scheduled-jobs' }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            email_module_1.EmailModule,
            security_module_1.SecurityModule,
            metrics_module_1.MetricsModule,
        ],
        providers: [
            email_processor_1.EmailProcessor,
            malware_scan_processor_1.MalwareScanProcessor,
            alert_processor_1.AlertProcessor,
            escrow_reconciliation_processor_1.EscrowReconciliationProcessor,
        ],
    })
], WorkerModule);
//# sourceMappingURL=worker.module.js.map