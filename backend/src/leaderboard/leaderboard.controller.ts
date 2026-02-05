import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
    constructor(private leaderboardService: LeaderboardService) { }

    @Get()
    @ApiOperation({ summary: 'Get leaderboard' })
    @ApiQuery({ name: 'period', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getLeaderboard(
        @Query('period') period?: string,
        @Query('limit') limit?: string,
    ) {
        return this.leaderboardService.getLeaderboard(
            period || 'all-time',
            limit ? parseInt(limit) : 100,
        );
    }

    @Get('user/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user rank' })
    @ApiQuery({ name: 'period', required: false })
    getUserRank(
        @Param('userId') userId: string,
        @Query('period') period?: string,
    ) {
        return this.leaderboardService.getUserRank(userId, period || 'all-time');
    }

    @Post('update')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update leaderboard (admin only)' })
    updateLeaderboard(@Query('period') period?: string) {
        return this.leaderboardService.updateLeaderboard(period || 'all-time');
    }

    @Post('update-all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update all leaderboard periods (admin only)' })
    updateAllPeriods() {
        return this.leaderboardService.updateAllPeriods();
    }
}
