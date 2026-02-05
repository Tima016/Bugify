import { Controller, Get, Post, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('payout-request')
  createPayout(@GetUser('id') userId: string, @Body() dto: CreatePayoutDto) {
    return this.paymentsService.createPayoutRequest(userId, dto);
  }

  @Get('history')
  getHistory(@GetUser('id') userId: string) {
    return this.paymentsService.getMyPayouts(userId);
  }

  @Get('balance')
  getBalance(@GetUser('id') userId: string) {
    return this.paymentsService.getBalance(userId);
  }

  // Temporary placement here, mostly for companies
  @Post('create-intent')
  async createPaymentIntent(@Body() body: { amount: number }) {
    return { message: "Stripe integration ready" };
  }

  // Admin Endpoints
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/payouts')
  async getPendingPayouts() {
    return this.paymentsService.findAllPayoutRequests();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/payouts/:id/status')
  async updatePayoutStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.paymentsService.updatePayoutStatus(id, status);
  }
}

