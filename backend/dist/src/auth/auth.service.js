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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const token_service_1 = require("./services/token.service");
const login_guard_service_1 = require("./services/login-guard.service");
const bcrypt = __importStar(require("bcrypt"));
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
const DUMMY_HASH = '$2b$12$LJ3m4ys3Rl5pJrSQJxN5/.D0Fq1FcOYqR3VxBwL7MhXn8JVAo3UW2';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    tokenService;
    loginGuardService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, tokenService, loginGuardService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
        this.loginGuardService = loginGuardService;
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
                    role: role || 'RESEARCHER',
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
        const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.role);
        return { user, ...tokens };
    }
    async login(loginDto, clientIp) {
        const { emailOrUsername, password, twoFactorCode } = loginDto;
        const ipLock = await this.loginGuardService.isLockedOut(clientIp);
        if (ipLock.locked) {
            throw new common_1.ForbiddenException(`Account locked due to too many failed attempts. Try again after ${ipLock.endsAt?.toISOString()}`);
        }
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
        });
        const hashToCompare = user?.passwordHash || DUMMY_HASH;
        const isPasswordValid = await bcrypt.compare(password, hashToCompare);
        if (!user || !isPasswordValid) {
            await this.loginGuardService.recordFailedAttempt(clientIp, user?.id);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const userLock = await this.loginGuardService.isLockedOut(user.id);
        if (userLock.locked) {
            throw new common_1.ForbiddenException(`Account locked due to too many failed attempts. Try again later.`);
        }
        if (user.isBanned) {
            throw new common_1.ForbiddenException('Account is banned');
        }
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                throw new common_1.UnauthorizedException('2FA code required');
            }
            const isValid = await this.verifyTwoFactorCode(twoFactorCode, user.id);
            if (!isValid) {
                await this.loginGuardService.recordFailedAttempt(clientIp, user.id);
                throw new common_1.UnauthorizedException('Invalid 2FA code');
            }
        }
        await this.loginGuardService.clearAttempts(clientIp, user.id);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.role);
        const { passwordHash, twoFactorSecret, backupCodes, ...safeUser } = user;
        return { user: safeUser, ...tokens };
    }
    async refreshTokens(refreshToken) {
        return this.tokenService.rotateRefreshToken(refreshToken);
    }
    async logout(refreshToken) {
        try {
            const payload = await this.tokenService['jwtService'].verifyAsync(refreshToken);
            if (payload.familyId) {
                await this.tokenService.revokeTokenFamily(payload.familyId);
            }
        }
        catch {
        }
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
                twoFactorSecret: null,
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
        const qrCode = await (0, qrcode_1.toDataURL)(`otpauth://totp/Bugify:${user.email}?secret=${secret}`);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_service_1.TokenService,
        login_guard_service_1.LoginGuardService])
], AuthService);
//# sourceMappingURL=auth.service.js.map