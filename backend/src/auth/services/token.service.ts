// ============================================
// Token Service — Redis-Backed Refresh Token Rotation
// Implements jti family tracking for token theft detection
// ============================================
import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { randomUUID } from 'crypto';

// Redis key prefixes
const REFRESH_TOKEN_PREFIX = 'rt:'; // rt:{jti} -> { userId, familyId }
const TOKEN_FAMILY_PREFIX = 'tf:'; // tf:{familyId} -> 'active' | 'revoked'

// TTLs (in ms for cache-manager)
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_TOKEN_EXPIRY = '10m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
    sub: string;
    email: string;
    role: string;
    jti?: string;
    familyId?: string;
}

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);

    constructor(
        private jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cache: any,
    ) { }

    /**
     * Generate a new token pair (access + refresh).
     * Creates a new token family on initial login.
     */
    async generateTokenPair(userId: string, email: string, role: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const familyId = randomUUID();
        const jti = randomUUID();

        const accessToken = await this.jwtService.signAsync(
            { sub: userId, email, role },
            { expiresIn: ACCESS_TOKEN_EXPIRY },
        );

        const refreshToken = await this.jwtService.signAsync(
            { sub: userId, email, role, jti, familyId },
            { expiresIn: REFRESH_TOKEN_EXPIRY },
        );

        // Store refresh token metadata in Redis
        await this.cache.set(
            `${REFRESH_TOKEN_PREFIX}${jti}`,
            JSON.stringify({ userId, familyId, used: false }),
            REFRESH_TOKEN_TTL,
        );

        // Mark family as active
        await this.cache.set(
            `${TOKEN_FAMILY_PREFIX}${familyId}`,
            'active',
            REFRESH_TOKEN_TTL,
        );

        return { accessToken, refreshToken };
    }

    /**
     * Rotate refresh token — issue new pair, invalidate old jti.
     * If old jti was already used → TOKEN THEFT DETECTED → revoke entire family.
     */
    async rotateRefreshToken(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        let payload: TokenPayload;

        try {
            payload = await this.jwtService.verifyAsync<TokenPayload>(oldRefreshToken);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const { sub: userId, email, role, jti, familyId } = payload;

        if (!jti || !familyId) {
            throw new UnauthorizedException('Malformed refresh token');
        }

        // Check if family is still active
        const familyStatus = await this.cache.get(`${TOKEN_FAMILY_PREFIX}${familyId}`);
        if (familyStatus === 'revoked') {
            this.logger.warn(`Token theft detected! Family ${familyId} for user ${userId} was already revoked.`);
            throw new UnauthorizedException('Token family revoked — please login again');
        }

        // Check if this specific jti has been used before
        const tokenDataRaw = await this.cache.get(`${REFRESH_TOKEN_PREFIX}${jti}`);
        if (!tokenDataRaw) {
            // Token not in Redis (expired or never existed)
            throw new UnauthorizedException('Refresh token expired or invalid');
        }

        const tokenData = JSON.parse(tokenDataRaw as string);

        if (tokenData.used) {
            // ⚠️ TOKEN REUSE DETECTED — revoke entire family
            this.logger.error(
                `SECURITY: Refresh token reuse detected! jti=${jti}, familyId=${familyId}, userId=${userId}. Revoking entire token family.`,
            );
            await this.revokeTokenFamily(familyId);
            throw new UnauthorizedException('Token reuse detected — all sessions revoked. Please login again.');
        }

        // Mark old token as used (but keep it so we can detect reuse)
        await this.cache.set(
            `${REFRESH_TOKEN_PREFIX}${jti}`,
            JSON.stringify({ ...tokenData, used: true }),
            REFRESH_TOKEN_TTL,
        );

        // Issue new token pair in the same family
        const newJti = randomUUID();

        const accessToken = await this.jwtService.signAsync(
            { sub: userId, email, role },
            { expiresIn: ACCESS_TOKEN_EXPIRY },
        );

        const refreshToken = await this.jwtService.signAsync(
            { sub: userId, email, role, jti: newJti, familyId },
            { expiresIn: REFRESH_TOKEN_EXPIRY },
        );

        // Store new refresh token
        await this.cache.set(
            `${REFRESH_TOKEN_PREFIX}${newJti}`,
            JSON.stringify({ userId, familyId, used: false }),
            REFRESH_TOKEN_TTL,
        );

        return { accessToken, refreshToken };
    }

    /**
     * Revoke an entire token family (e.g., on logout or theft detection).
     */
    async revokeTokenFamily(familyId: string): Promise<void> {
        await this.cache.set(
            `${TOKEN_FAMILY_PREFIX}${familyId}`,
            'revoked',
            REFRESH_TOKEN_TTL,
        );
    }

    /**
     * Revoke all families for a user (global logout).
     * Note: requires user-to-family mapping if needed at scale.
     * For now: handled by changing JWT secret or password.
     */
    async revokeRefreshToken(jti: string): Promise<void> {
        await this.cache.del(`${REFRESH_TOKEN_PREFIX}${jti}`);
    }
}
