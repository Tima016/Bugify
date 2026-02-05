import { Module } from '@nestjs/common';
import { WebhookService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [WebhookService],
    controllers: [WebhooksController],
    exports: [WebhookService],
})
export class WebhooksModule { }
