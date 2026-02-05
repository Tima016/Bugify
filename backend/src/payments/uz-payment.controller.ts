import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UzPaymentService, PaymentProvider, IPaymentResponse } from './uz-payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('uz-payments')
@Controller('uz-payments')
export class UzPaymentController {
    constructor(private uzPaymentService: UzPaymentService) { }

    @Post('uzcard/initiate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Initiate UzCard payment' })
    async initiateUzCard(@Body() body: any): Promise<IPaymentResponse> {
        return this.uzPaymentService.initiateUzCardPayment({
            ...body,
            provider: PaymentProvider.UZCARD,
        });
    }

    @Post('humo/initiate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Initiate Humo payment' })
    async initiateHumo(@Body() body: any): Promise<IPaymentResponse> {
        return this.uzPaymentService.initiateHumoPayment({
            ...body,
            provider: PaymentProvider.HUMO,
        });
    }

    @Post('callback/:provider')
    @ApiOperation({ summary: 'Handle payment callback' })
    async handleCallback(
        @Param('provider') provider: string,
        @Body() body: any,
    ) {
        const providerEnum = provider.toUpperCase() as PaymentProvider;
        return this.uzPaymentService.handlePaymentCallback(providerEnum, body);
    }

    @Get('status/:transactionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get payment status' })
    async getStatus(@Param('transactionId') transactionId: string) {
        return this.uzPaymentService.getPaymentStatus(transactionId);
    }

    @Post('refund/:transactionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refund payment' })
    async refund(
        @Param('transactionId') transactionId: string,
        @Body() body: { reason: string },
    ) {
        return this.uzPaymentService.refundPayment(transactionId, body.reason);
    }
}
