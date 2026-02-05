import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WebhookService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
    constructor(private webhookService: WebhookService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Register webhook' })
    async registerWebhook(@Request() req, @Body() body: any) {
        return this.webhookService.registerWebhook({
            ...body,
            userId: req.user.id,
        });
    }

    @Get(':id/logs')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get webhook logs' })
    async getWebhookLogs(@Param('id') id: string) {
        return this.webhookService.getWebhookLogs(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete webhook' })
    async deleteWebhook(@Param('id') id: string, @Request() req) {
        return this.webhookService.deleteWebhook(id, req.user.id);
    }
}
