import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
    providers: [NotificationsGateway, NotificationsService],
    exports: [NotificationsGateway, NotificationsService],
    controllers: [NotificationsController],
})
export class NotificationsModule { }
