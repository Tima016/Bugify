"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const cache_manager_1 = require("@nestjs/cache-manager");
const crypto_1 = require("crypto");
const REFRESH_TOKEN_PREFIX = 'rt:';
const TOKEN_FAMILY_PREFIX = 'tf:';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;
const ACCESS_TOKEN_EXPIRY = '10m';
const REFRESH_TOKEN_EXPIRY = '7d';
let TokenService = TokenService_1 = class TokenService {
    jwtService;
    cache;
    logger = new common_1.Logger(TokenService_1.name);
    constructor(jwtService, cache) {
        this.jwtService = jwtService;
        this.cache = cache;
    }
    async generateTokenPair(userId, email, role) {
        const familyId = (0, crypto_1.randomUUID)();
        const jti = (0, crypto_1.randomUUID)();
        const accessToken = await this.jwtService.signAsync({ sub: userId, email, role }, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = await this.jwtService.signAsync({ sub: userId, email, role, jti, familyId }, { expiresIn: REFRESH_TOKEN_EXPIRY });
        await this.cache.set(`${REFRESH_TOKEN_PREFIX}${jti}`, JSON.stringify({ userId, familyId, used: false }), REFRESH_TOKEN_TTL);
        await this.cache.set(`${TOKEN_FAMILY_PREFIX}${familyId}`, 'active', REFRESH_TOKEN_TTL);
        return { accessToken, refreshToken };
    }
    async rotateRefreshToken(oldRefreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(oldRefreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const { sub: userId, email, role, jti, familyId } = payload;
        if (!jti || !familyId) {
            throw new common_1.UnauthorizedException('Malformed refresh token');
        }
        const familyStatus = await this.cache.get(`${TOKEN_FAMILY_PREFIX}${familyId}`);
        if (familyStatus === 'revoked') {
            this.logger.warn(`Token theft detected! Family ${familyId} for user ${userId} was already revoked.`);
            throw new common_1.UnauthorizedException('Token family revoked — please login again');
        }
        const tokenDataRaw = await this.cache.get(`${REFRESH_TOKEN_PREFIX}${jti}`);
        if (!tokenDataRaw) {
            throw new common_1.UnauthorizedException('Refresh token expired or invalid');
        }
        const tokenData = JSON.parse(tokenDataRaw);
        if (tokenData.used) {
            this.logger.error(`SECURITY: Refresh token reuse detected! jti=${jti}, familyId=${familyId}, userId=${userId}. Revoking entire token family.`);
            await this.revokeTokenFamily(familyId);
            throw new common_1.UnauthorizedException('Token reuse detected — all sessions revoked. Please login again.');
        }
        await this.cache.set(`${REFRESH_TOKEN_PREFIX}${jti}`, JSON.stringify({ ...tokenData, used: true }), REFRESH_TOKEN_TTL);
        const newJti = (0, crypto_1.randomUUID)();
        const accessToken = await this.jwtService.signAsync({ sub: userId, email, role }, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = await this.jwtService.signAsync({ sub: userId, email, role, jti: newJti, familyId }, { expiresIn: REFRESH_TOKEN_EXPIRY });
        await this.cache.set(`${REFRESH_TOKEN_PREFIX}${newJti}`, JSON.stringify({ userId, familyId, used: false }), REFRESH_TOKEN_TTL);
        return { accessToken, refreshToken };
    }
    async revokeTokenFamily(familyId) {
        await this.cache.set(`${TOKEN_FAMILY_PREFIX}${familyId}`, 'revoked', REFRESH_TOKEN_TTL);
    }
    async revokeRefreshToken(jti) {
        await this.cache.del(`${REFRESH_TOKEN_PREFIX}${jti}`);
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [jwt_1.JwtService, Object])
], TokenService);
//# sourceMappingURL=token.service.js.map