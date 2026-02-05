export declare enum PaymentMethod {
    UZCARD = "UZCARD",
    HUMO = "HUMO",
    PAYPAL = "PAYPAL",
    CRYPTOCURRENCY = "CRYPTOCURRENCY"
}
export declare class PayoutDestinationDto {
    cardNumber?: string;
    walletAddress?: string;
    accountHolderName?: string;
}
export declare class CreatePayoutDto {
    amount: number;
    currency: string;
    method: PaymentMethod;
    destination: PayoutDestinationDto;
}
