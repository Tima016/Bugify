import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    role?: 'RESEARCHER' | 'COMPANY';

    @IsString()
    @IsOptional()
    companyName?: string;
}

export class LoginDto {
    @IsString()
    emailOrUsername: string;

    @IsString()
    password: string;
}
