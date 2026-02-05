import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }

    async createPaymentIntent(amount: number, currency = 'usd') {
        // Amount is in cents
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            payment_method_types: ['card'],
        });

        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        };
    }
}
