import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementsController {
    constructor(private achievementsService: AchievementsService) { }

    @Get('available')
    @ApiOperation({ summary: 'Get all available achievements' })
    getAvailableAchievements() {
        return this.achievementsService.getAvailableAchievements();
    }

    @Get('user/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user achievements' })
    getUserAchievements(@Param('userId') userId: string) {
        return this.achievementsService.getUserAchievements(userId);
    }

    @Get('user/:userId/stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get achievement statistics' })
    getAchievementStats(@Param('userId') userId: string) {
        return this.achievementsService.getAchievementStats(userId);
    }

    @Post('user/:userId/check')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check and award achievements' })
    checkAchievements(@Param('userId') userId: string) {
        return this.achievementsService.checkAchievements(userId);
    }
}
