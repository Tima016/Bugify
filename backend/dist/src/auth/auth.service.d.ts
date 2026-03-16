import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { LoginGuardService } from './services/login-guard.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private tokenService;
    private loginGuardService;
    private readonly logger;
    constructor(prisma: PrismaService, tokenService: TokenService, loginGuardService: LoginGuardService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            companyId: string | null;
        };
    }>;
    login(loginDto: LoginDto, clientIp: string): Promise<{
        accessToken: string;
        refreshToken: string;
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
            role: import(".prisma/client").$Enums.UserRole;
            reputationScore: number;
            totalEarnings: import("@prisma/client/runtime/library").Decimal;
            currentBalance: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            isEmailVerified: boolean;
            isPhoneVerified: boolean;
            isBanned: boolean;
            banReason: string | null;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
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
            riskLevel: import(".prisma/client").$Enums.RiskLevel;
            riskLockedAt: Date | null;
            riskOverrideBy: string | null;
            riskOverrideAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            companyId: string | null;
        };
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    verifyTwoFactorCode(code: string, userId: string): Promise<boolean>;
    enableTwoFactor(userId: string): Promise<void>;
    disableTwoFactor(userId: string): Promise<void>;
    changePassword(userId: string, changePasswordDto: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    enableTwoFactorFlow(userId: string): Promise<{
        qrCode: any;
        secret: string;
        backupCodes: string[];
        message: string;
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        profilePictureUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        twoFactorEnabled: boolean;
        companyId: string | null;
    } | null>;
}
