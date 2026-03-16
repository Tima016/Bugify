export interface LoginAttemptResult {
    isLocked: boolean;
    remainingAttempts: number;
    lockoutEndsAt?: Date;
}
export declare class LoginGuardService {
    private cache;
    private readonly logger;
    constructor(cache: any);
    isLockedOut(identifier: string): Promise<{
        locked: boolean;
        endsAt?: Date;
    }>;
    recordFailedAttempt(ip: string, userId?: string): Promise<LoginAttemptResult>;
    clearAttempts(ip: string, userId?: string): Promise<void>;
    private incrementAttempts;
}
