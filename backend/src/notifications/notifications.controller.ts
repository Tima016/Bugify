import { Controller, Get, Patch, Param, Query, UseGuards, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(
        @GetUser('id') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.notificationsService.findAll(userId, page ? +page : 1, limit ? +limit : 20);
    }

    @Patch('read-all')
    markAllAsRead(@GetUser('id') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string, @GetUser('id') userId: string) {
        return this.notificationsService.markAsRead(id, userId);
    }
}
