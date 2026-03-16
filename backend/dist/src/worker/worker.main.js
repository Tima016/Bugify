"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const worker_module_1 = require("./worker.module");
async function bootstrap() {
    const logger = new common_1.Logger('BugifyWorker');
    const app = await core_1.NestFactory.createApplicationContext(worker_module_1.WorkerModule);
    const signals = ['SIGTERM', 'SIGINT'];
    for (const signal of signals) {
        process.on(signal, async () => {
            logger.warn(`Received ${signal}, shutting down worker gracefully...`);
            await app.close();
            process.exit(0);
        });
    }
    logger.log('🔧 Bugify Worker started — processing background jobs');
    logger.log(`Queues: email, notifications, payments, achievements, webhooks, malware-scan`);
}
bootstrap();
//# sourceMappingURL=worker.main.js.map