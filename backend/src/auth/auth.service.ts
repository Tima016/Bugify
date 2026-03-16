// ============================================
// Auth Service — Hardened Authentication
// Integrates TokenService (rotation) and LoginGuardService (bruteforce)
// Anti-enumeration: timing-safe responses
// ============================================
import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { LoginGuardService } from './services/login-guard.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

// Dummy hash for anti-enumeration timing attacks
// Pre-computed bcrypt hash so invalid-user lookups take the same time as valid ones
const DUMMY_HASH = '$2b$12$LJ3m4ys3Rl5pJrSQJxN5/.D0Fq1FcOYqR3VxBwL7MhXn8JVAo3UW2';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private tokenService: TokenService,
        private loginGuardService: LoginGuardService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, username, password, firstName, lastName, role, companyName } = registerDto;

        if (role === 'COMPANY' && !companyName) {
            throw new ConflictException('Company name is required for company accounts');
        }

        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            throw new ConflictException('Email or username already exists');
        }

        if (role === 'COMPANY') {
            const existingCompany = await this.prisma.company.findUnique({
                where: { companyName },
            });
            if (existingCompany) {
                throw new ConflictException('Company name already registered');
            }
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await this.prisma.$transaction(async (tx) => {
            let companyId: string | null = null;

            if (role === 'COMPANY') {
                const company = await tx.company.create({
                    data: {
                        companyName: companyName!,
                        legalName: companyName!,
                        verificationStatus: 'PENDING',
                    },
                });
                companyId = company.id;
            }

            return tx.user.create({
                data: {
                    email,
                    username,
                    passwordHash,
                    firstName,
                    lastName,
                    role: (role as any) || 'RESEARCHER',
                    companyId,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    companyId: true,
                    createdAt: true,
                },
            });
        });

        // Generate token pair with family tracking
        const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.role);

        return { user, ...tokens };
    }

    async login(loginDto: LoginDto, clientIp: string) {
        const { emailOrUsername, password, twoFactorCode } = loginDto as LoginDto & { twoFactorCode?: string };

        // Check IP lockout first
        const ipLock = await this.loginGuardService.isLockedOut(clientIp);
        if (ipLock.locked) {
            throw new ForbiddenException(
                `Account locked due to too many failed attempts. Try again after ${ipLock.endsAt?.toISOString()}`,
            );
        }

        // Find user
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
        });

        // Anti-enumeration: always compare against a hash, even if user doesn't exist
        const hashToCompare = user?.passwordHash || DUMMY_HASH;
        const isPasswordValid = await bcrypt.compare(password, hashToCompare);

        if (!user || !isPasswordValid) {
            // Record failed attempt
            await this.loginGuardService.recordFailedAttempt(clientIp, user?.id);
            // Same error message regardless of which part failed
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check user-specific lockout
        const userLock = await this.loginGuardService.isLockedOut(user.id);
        if (userLock.locked) {
            throw new ForbiddenException(
                `Account locked due to too many failed attempts. Try again later.`,
            );
        }

        // Check ban status
        if (user.isBanned) {
            throw new ForbiddenException('Account is banned');
        }

        // 2FA check
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                throw new UnauthorizedException('2FA code required');
            }

            const isValid = await this.verifyTwoFactorCode(twoFactorCode, user.id);
            if (!isValid) {
                await this.loginGuardService.recordFailedAttempt(clientIp, user.id);
                throw new UnauthorizedException('Invalid 2FA code');
            }
        }

        // Success — clear lockout counters
        await this.loginGuardService.clearAttempts(clientIp, user.id);

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate token pair with family tracking
        const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.role);

        // Return user without sensitive fields
        const { passwordHash, twoFactorSecret, backupCodes, ...safeUser } = user;

        return { user: safeUser, ...tokens };
    }

    async refreshTokens(refreshToken: string) {
        return this.tokenService.rotateRefreshToken(refreshToken);
    }

    async logout(refreshToken: string) {
        try {
            const payload = await this.tokenService['jwtService'].verifyAsync(refreshToken);
            if (payload.familyId) {
                await this.tokenService.revokeTokenFamily(payload.familyId);
            }
        } catch {
            // Token might be expired, still clear cookies in controller
        }
    }

    async verifyTwoFactorCode(code: string, userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.twoFactorSecret) {
            return false;
        }

        return authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });
    }

    async enableTwoFactor(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true },
        });
    }

    async disableTwoFactor(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });
    }

    async changePassword(userId: string, changePasswordDto: { currentPassword: string; newPassword: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);

        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });

        return { message: 'Password changed successfully' };
    }

    async enableTwoFactorFlow(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const secret = authenticator.generateSecret();
        const qrCode = await toDataURL(`otpauth://totp/Bugify:${user.email}?secret=${secret}`);

        const backupCodes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase(),
        );

        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret },
        });

        return {
            qrCode,
            secret,
            backupCodes,
            message: 'Scan the QR code with your authenticator app',
        };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                profilePictureUrl: true,
                reputationScore: true,
                totalEarnings: true,
                twoFactorEnabled: true,
            },
        });

        return user;
    }
}
