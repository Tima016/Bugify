// ============================================
// Bugify Worker — Standalone BullMQ Consumer
// Runs in its own Docker container, no HTTP server
// ============================================
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap() {
    const logger = new Logger('BugifyWorker');

    const app = await NestFactory.createApplicationContext(WorkerModule);

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
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
