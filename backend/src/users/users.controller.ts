import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getMyProfile(@Request() req) {
        return this.usersService.getProfile(req.user.id);
    }

    @Get('leaderboard')
    async getLeaderboard() {
        return this.usersService.getLeaderboard(10);
    }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Request() req, @Body() updateData: any) {
        return this.usersService.updateProfile(req.user.id, updateData);
    }

    @Patch('notification-preferences')
    @UseGuards(JwtAuthGuard)
    async updateNotificationPreferences(@Request() req, @Body() preferences: any) {
        return this.usersService.updateNotificationPreferences(req.user.id, preferences);
    }

    @Patch('privacy-settings')
    @UseGuards(JwtAuthGuard)
    async updatePrivacySettings(@Request() req, @Body() settings: any) {
        return this.usersService.updatePrivacySettings(req.user.id, settings);
    }

    @Patch('preferences')
    @UseGuards(JwtAuthGuard)
    async updatePreferences(@Request() req, @Body() preferences: any) {
        return this.usersService.updatePreferences(req.user.id, preferences);
    }

    @Post('export-data')
    @UseGuards(JwtAuthGuard)
    async exportData(@Request() req) {
        return this.usersService.requestDataExport(req.user.id);
    }

    @Post('request-data-deletion')
    @UseGuards(JwtAuthGuard)
    async requestDataDeletion(@Request() req) {
        return this.usersService.requestDataDeletion(req.user.id);
    }
}
