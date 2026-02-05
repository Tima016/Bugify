import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { EnableTwoFactorDto } from './dto/two-factor.dto';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, username, password, firstName, lastName, role, companyName } = registerDto;

        // Validation: Company name required for COMPANY role
        if (role === 'COMPANY' && !companyName) {
            throw new ConflictException('Company name is required for company accounts');
        }

        // Check if user already exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            throw new ConflictException('Email or username already exists');
        }

        // Check if company exists if registering as company
        if (role === 'COMPANY') {
            const existingCompany = await this.prisma.company.findUnique({
                where: { companyName },
            });
            if (existingCompany) {
                throw new ConflictException('Company name already registered');
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Transaction to create User and potentially Company
        const user = await this.prisma.$transaction(async (tx) => {
            let companyId: string | null = null;

            if (role === 'COMPANY') {
                const company = await tx.company.create({
                    data: {
                        companyName: companyName!,
                        legalName: companyName!, // Defaulting legal name to company name for simple signup
                        verificationStatus: 'PENDING'
                    }
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
                    companyId
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

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            user,
            ...tokens,
        };
    }

    async login(loginDto: LoginDto) {
        const { emailOrUsername, password, twoFactorCode } = loginDto as LoginDto & { twoFactorCode?: string };

        // Find user by email or username
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check 2FA
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                // Return explicitly that 2FA is required, or throw exception
                // For this implementation, we throw specific error that frontend can catch
                throw new UnauthorizedException('2FA code required');
            }

            const isValid = await this.verifyTwoFactorCode(twoFactorCode, user.id);
            if (!isValid) {
                throw new UnauthorizedException('Invalid 2FA code');
            }
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            user,
            ...tokens,
        };
    }

    // New method to verify refresh token and generate new pair (simplified)
    async refreshTokens(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            return this.generateTokens(user.id, user.email, user.role);
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async generateTwoFactorSecret(user: { id: string; email: string }) {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'UzSecure', secret);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { twoFactorSecret: secret },
        });

        const qrCodeUrl = await toDataURL(otpauthUrl);

        return {
            secret,
            qrCodeUrl,
        };
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
                twoFactorSecret: null
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

        // Verify current password
        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);

        // Update password
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

        // Generate 2FA secret and QR code
        const secret = authenticator.generateSecret();
        const qrCode = await toDataURL(`otpauth://totp/UzSecure:${user.email}?secret=${secret}`);

        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
        );

        // Save secret temporarily (not enabled yet until verified)
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
    // ... (rest of methods)

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

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = await this.jwtService.signAsync(payload);

        // For refresh token, we'd typically use a separate service with different secret
        // For now, using the same token with longer expiration
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}
