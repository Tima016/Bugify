import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationController {
    constructor(private invitationService: InvitationService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create invitation code' })
    async createInvitation(@Request() req, @Body() body: any) {
        return this.invitationService.createInvitation(
            req.user.companyId,
            req.user.id,
            body,
        );
    }

    @Post('validate')
    @ApiOperation({ summary: 'Validate invitation code' })
    async validateCode(@Body() body: { code: string; email?: string }) {
        return this.invitationService.validateAndUseCode(body.code, body.email);
    }

    @Get('company/:companyId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get company invitations' })
    async getCompanyInvitations(@Param('companyId') companyId: string) {
        return this.invitationService.getCompanyInvitations(companyId);
    }

    @Get('company/:companyId/stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get invitation statistics' })
    async getStats(@Param('companyId') companyId: string) {
        return this.invitationService.getInvitationStats(companyId);
    }

    @Patch(':code/deactivate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Deactivate invitation code' })
    async deactivateInvitation(@Param('code') code: string, @Request() req) {
        return this.invitationService.deactivateInvitation(code, req.user.companyId);
    }
}
