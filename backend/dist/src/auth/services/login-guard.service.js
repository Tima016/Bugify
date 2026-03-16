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
var LoginGuardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginGuardService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const LOGIN_ATTEMPTS_PREFIX = 'la:';
const LOCKOUT_PREFIX = 'lockout:';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
let LoginGuardService = LoginGuardService_1 = class LoginGuardService {
    cache;
    logger = new common_1.Logger(LoginGuardService_1.name);
    constructor(cache) {
        this.cache = cache;
    }
    async isLockedOut(identifier) {
        const lockoutData = await this.cache.get(`${LOCKOUT_PREFIX}${identifier}`);
        if (lockoutData) {
            const parsed = JSON.parse(lockoutData);
            return { locked: true, endsAt: new Date(parsed.endsAt) };
        }
        return { locked: false };
    }
    async recordFailedAttempt(ip, userId) {
        const ipResult = await this.incrementAttempts(ip);
        let userResult = null;
        if (userId) {
            userResult = await this.incrementAttempts(userId);
        }
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
    async clearAttempts(ip, userId) {
        await this.cache.del(`${LOGIN_ATTEMPTS_PREFIX}${ip}`);
        await this.cache.del(`${LOCKOUT_PREFIX}${ip}`);
        if (userId) {
            await this.cache.del(`${LOGIN_ATTEMPTS_PREFIX}${userId}`);
            await this.cache.del(`${LOCKOUT_PREFIX}${userId}`);
        }
    }
    async incrementAttempts(identifier) {
        const key = `${LOGIN_ATTEMPTS_PREFIX}${identifier}`;
        const currentRaw = await this.cache.get(key);
        const current = currentRaw ? parseInt(currentRaw, 10) : 0;
        const newCount = current + 1;
        if (newCount >= MAX_ATTEMPTS) {
            const endsAt = new Date(Date.now() + LOCKOUT_DURATION_MS);
            await this.cache.set(`${LOCKOUT_PREFIX}${identifier}`, JSON.stringify({ endsAt: endsAt.toISOString(), attempts: newCount }), LOCKOUT_DURATION_MS);
            await this.cache.del(key);
            return { isLocked: true, remainingAttempts: 0, lockoutEndsAt: endsAt };
        }
        await this.cache.set(key, String(newCount), ATTEMPT_WINDOW_MS);
        return { isLocked: false, remainingAttempts: MAX_ATTEMPTS - newCount };
    }
};
exports.LoginGuardService = LoginGuardService;
exports.LoginGuardService = LoginGuardService = LoginGuardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], LoginGuardService);
//# sourceMappingURL=login-guard.service.js.map