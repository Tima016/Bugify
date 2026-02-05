"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, username, password, firstName, lastName, role, companyName } = registerDto;
        if (role === 'COMPANY' && !companyName) {
            throw new common_1.ConflictException('Company name is required for company accounts');
        }
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email or username already exists');
        }
        if (role === 'COMPANY') {
            const existingCompany = await this.prisma.company.findUnique({
                where: { companyName },
            });
            if (existingCompany) {
                throw new common_1.ConflictException('Company name already registered');
            }
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.prisma.$transaction(async (tx) => {
            let companyId = null;
            if (role === 'COMPANY') {
                const company = await tx.company.create({
                    data: {
                        companyName: companyName,
                        legalName: companyName,
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
                    role: role || 'RESEARCHER',
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
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user,
            ...tokens,
        };
    }
    async login(loginDto) {
        const { emailOrUsername, password, twoFactorCode } = loginDto;
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                throw new common_1.UnauthorizedException('2FA code required');
            }
            const isValid = await this.verifyTwoFactorCode(twoFactorCode, user.id);
            if (!isValid) {
                throw new common_1.UnauthorizedException('Invalid 2FA code');
            }
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user,
            ...tokens,
        };
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            return this.generateTokens(user.id, user.email, user.role);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async generateTwoFactorSecret(user) {
        const secret = otplib_1.authenticator.generateSecret();
        const otpauthUrl = otplib_1.authenticator.keyuri(user.email, 'UzSecure', secret);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { twoFactorSecret: secret },
        });
        const qrCodeUrl = await (0, qrcode_1.toDataURL)(otpauthUrl);
        return {
            secret,
            qrCodeUrl,
        };
    }
    async verifyTwoFactorCode(code, userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            return false;
        }
        return otplib_1.authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });
    }
    async enableTwoFactor(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true },
        });
    }
    async disableTwoFactor(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null
            },
        });
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        return { message: 'Password changed successfully' };
    }
    async enableTwoFactorFlow(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const secret = otplib_1.authenticator.generateSecret();
        const qrCode = await (0, qrcode_1.toDataURL)(`otpauth://totp/UzSecure:${user.email}?secret=${secret}`);
        const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
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
    async validateUser(userId) {
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
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map