import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, PayoutStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private adminService: AdminService) { }

    /**
     * Get platform dashboard statistics
     */
    @Get('dashboard-stats')
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    /**
     * Get all users with filters
     */
    @Get('users')
    async getAllUsers(
        @Query('role') role?: UserRole,
        @Query('isVerified') isVerified?: string,
        @Query('isBanned') isBanned?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getAllUsers({
            role,
            isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
            isBanned: isBanned === 'true' ? true : isBanned === 'false' ? false : undefined,
            search,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    /**
     * Toggle company verification
     */
    @Patch('users/:id/verify')
    async verifyCompany(@Param('id') userId: string) {
        return this.adminService.verifyCompany(userId);
    }

    /**
     * Ban or unban user
     */
    @Patch('users/:id/ban')
    async banUser(
        @Param('id') userId: string,
        @Body('reason') reason?: string
    ) {
        return this.adminService.banUser(userId, reason);
    }

    /**
     * Update user details
     */
    @Patch('users/:id')
    async updateUser(
        @Param('id') userId: string,
        @Body() data: {
            firstName?: string;
            lastName?: string;
            email?: string;
            role?: string;
        }
    ) {
        return this.adminService.updateUser(userId, data as any);
    }

    /**
     * Delete user (soft delete)
     */
    @Delete('users/:id')
    async deleteUser(@Param('id') userId: string) {
        return this.adminService.deleteUser(userId);
    }

    /**
     * Get all reports (global view)
     */
    @Get('reports')
    async getAllReports(
        @Query('status') status?: string,
        @Query('severity') severity?: string,
        @Query('programId') programId?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getAllReports({
            status,
            severity,
            programId,
            search,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    /**
     * Get all payout requests
     */
    @Get('payouts')
    async getAllPayouts(@Query('status') status?: PayoutStatus) {
        return this.adminService.getAllPayouts(status);
    }

    /**
     * Process payout request (approve or reject)
     */
    @Patch('payouts/:id/process')
    async processPayout(
        @Param('id') payoutId: string,
        @Body('status') status: 'COMPLETED' | 'REJECTED',
        @Body('transactionRef') transactionRef?: string,
        @Body('adminNotes') adminNotes?: string,
    ) {
        return this.adminService.processPayout(payoutId, status, transactionRef, adminNotes);
    }

    /**
     * Get all transactions
     */
    @Get('transactions')
    async getTransactions(
        @Query('status') status?: string,
        @Query('userId') userId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const filters = {
            status,
            userId,
            page: Number(page) || 1,
            limit: Number(limit) || 20
        };
        return this.adminService.getTransactionLogs(filters);
    }

    /**
     * Get analytics data
     */
    @Get('analytics/user-growth')
    async getUserGrowth(@Query('days') days?: string) {
        return this.adminService.getUserGrowthData(Number(days) || 30);
    }

    @Get('analytics/report-trends')
    async getReportTrends(@Query('days') days?: string) {
        return this.adminService.getReportTrends(Number(days) || 30);
    }

    @Get('analytics/revenue-trends')
    async getRevenueTrends(@Query('days') days?: string) {
        return this.adminService.getRevenueTrends(Number(days) || 30);
    }

    /**
     * Get KYC review queue
     */
    @Get('kyc/queue')
    async getKycQueue() {
        return this.adminService.getKycQueue();
    }

    /**
     * Review KYC submission
     */
    @Patch('kyc/:userId/review')
    async reviewKyc(
        @Param('userId') userId: string,
        @Body('status') status: 'APPROVED' | 'REJECTED',
        @Body('notes') notes?: string
    ) {
        return this.adminService.reviewKyc(userId, status, notes);
    }

    /**
     * Bulk verify companies
     */
    @Post('users/bulk/verify')
    async bulkVerifyCompanies(@Body('userIds') userIds: string[]) {
        return this.adminService.bulkVerifyCompanies(userIds);
    }

    /**
     * Bulk ban users
     */
    @Post('users/bulk/ban')
    async bulkBanUsers(
        @Body('userIds') userIds: string[],
        @Body('reason') reason: string
    ) {
        return this.adminService.bulkBanUsers(userIds, reason);
    }

    /**
     * Bulk delete users
     */
    @Post('users/bulk/delete')
    async bulkDeleteUsers(@Body('userIds') userIds: string[]) {
        return this.adminService.bulkDeleteUsers(userIds);
    }
}
