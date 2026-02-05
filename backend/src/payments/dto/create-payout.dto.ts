import { IsNumber, IsString, IsEnum, IsPositive, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
    UZCARD = 'UZCARD',
    HUMO = 'HUMO',
    PAYPAL = 'PAYPAL',
    CRYPTOCURRENCY = 'CRYPTOCURRENCY',
}

export class PayoutDestinationDto {
    @IsString()
    cardNumber?: string;

    @IsString()
    walletAddress?: string;

    @IsString()
    accountHolderName?: string;
}

export class CreatePayoutDto {
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsString()
    currency: string = 'USD';

    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @IsObject()
    @ValidateNested()
    @Type(() => PayoutDestinationDto)
    destination: PayoutDestinationDto;
}
