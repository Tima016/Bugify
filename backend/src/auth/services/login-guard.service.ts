// ============================================
// Login Guard Service — Anti-Bruteforce Protection
// Redis-backed login attempt tracking with account lockout
// ============================================
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const LOGIN_ATTEMPTS_PREFIX = 'la:';   // la:{ip} or la:{userId}
const LOCKOUT_PREFIX = 'lockout:';     // lockout:{ip} or lockout:{userId}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;  // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;    // 15 minutes

export interface LoginAttemptResult {
    isLocked: boolean;
    remainingAttempts: number;
    lockoutEndsAt?: Date;
}

@Injectable()
export class LoginGuardService {
    private readonly logger = new Logger(LoginGuardService.name);

    constructor(
        @Inject(CACHE_MANAGER) private cache: any,
    ) { }

    /**
     * Check if an IP or userId is currently locked out.
     */
    async isLockedOut(identifier: string): Promise<{ locked: boolean; endsAt?: Date }> {
        const lockoutData = await this.cache.get(`${LOCKOUT_PREFIX}${identifier}`);
        if (lockoutData) {
            const parsed = JSON.parse(lockoutData as string);
            return { locked: true, endsAt: new Date(parsed.endsAt) };
        }
        return { locked: false };
    }

    /**
     * Record a failed login attempt. Returns lockout status.
     */
    async recordFailedAttempt(ip: string, userId?: string): Promise<LoginAttemptResult> {
        // Track by IP
        const ipResult = await this.incrementAttempts(ip);

        // Also track by userId if known (prevents distributed bruteforce)
        let userResult: LoginAttemptResult | null = null;
        if (userId) {
            userResult = await this.incrementAttempts(userId);
        }

        // Lock out if either threshold is breached
        if (ipResult.isLocked) {
            this.logger.warn(`Account locked out for IP: ${ip}`);
            return ipResult;
        }
        if (userResult?.isLocked) {
            this.logger.warn(`Account locked out for user: ${userId}`);
            return userResult;
        }

        return ipResult;
    }

    /**
     * Clear attempts on successful login.
     */
    async clearAttempts(ip: string, userId?: string): Promise<void> {
        await this.cache.del(`${LOGIN_ATTEMPTS_PREFIX}${ip}`);
        await this.cache.del(`${LOCKOUT_PREFIX}${ip}`);
        if (userId) {
            await this.cache.del(`${LOGIN_ATTEMPTS_PREFIX}${userId}`);
            await this.cache.del(`${LOCKOUT_PREFIX}${userId}`);
        }
    }

    private async incrementAttempts(identifier: string): Promise<LoginAttemptResult> {
        const key = `${LOGIN_ATTEMPTS_PREFIX}${identifier}`;
        const currentRaw = await this.cache.get(key);
        const current = currentRaw ? parseInt(currentRaw as string, 10) : 0;
        const newCount = current + 1;

        if (newCount >= MAX_ATTEMPTS) {
            // Lock out
            const endsAt = new Date(Date.now() + LOCKOUT_DURATION_MS);
            await this.cache.set(
                `${LOCKOUT_PREFIX}${identifier}`,
                JSON.stringify({ endsAt: endsAt.toISOString(), attempts: newCount }),
                LOCKOUT_DURATION_MS,
            );
            // Reset counter
            await this.cache.del(key);

            return { isLocked: true, remainingAttempts: 0, lockoutEndsAt: endsAt };
        }

        await this.cache.set(key, String(newCount), ATTEMPT_WINDOW_MS);

        return { isLocked: false, remainingAttempts: MAX_ATTEMPTS - newCount };
    }
}
