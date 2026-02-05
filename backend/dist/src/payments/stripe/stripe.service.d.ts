export declare class StripeService {
    private stripe;
    constructor();
    createPaymentIntent(amount: number, currency?: string): Promise<{
        clientSecret: string | null;
        id: string;
    }>;
}
