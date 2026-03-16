import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as Prisma from '@prisma/client';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
            role: Prisma.$Enums.UserRole;
            createdAt: Date;
            companyId: string | null;
        };
    }>;
    login(loginDto: LoginDto, req: Request, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string | null;
            countryCode: string;
            profilePictureUrl: string | null;
            bio: string | null;
            role: Prisma.$Enums.UserRole;
            reputationScore: number;
            totalEarnings: import("@prisma/client/runtime/library").Decimal;
            currentBalance: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            isEmailVerified: boolean;
            isPhoneVerified: boolean;
            isBanned: boolean;
            banReason: string | null;
            kycStatus: Prisma.$Enums.KycStatus;
            kycDocuments: import("@prisma/client/runtime/library").JsonValue | null;
            twoFactorEnabled: boolean;
            preferredLanguage: string;
            timezone: string;
            notificationPreferences: import("@prisma/client/runtime/library").JsonValue | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            skills: string[];
            certifications: import("@prisma/client/runtime/library").JsonValue | null;
            lastLoginAt: Date | null;
            lastActiveAt: Date | null;
            riskScore: number;
            riskLevel: Prisma.$Enums.RiskLevel;
            riskLockedAt: Date | null;
            riskOverrideBy: string | null;
            riskOverrideAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            companyId: string | null;
        };
    }>;
    refresh(req: Request, res: Response): Promise<{
        message: string;
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
    changePassword(user: Prisma.User, changePasswordDto: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    enableTwoFactor(user: Prisma.User): Promise<{
        qrCode: any;
        secret: string;
        backupCodes: string[];
        message: string;
    }>;
    disableTwoFactor(user: Prisma.User): Promise<{
        message: string;
    }>;
}
