import { JwtService } from '@nestjs/jwt';
export interface TokenPayload {
    sub: string;
    email: string;
    role: string;
    jti?: string;
    familyId?: string;
}
export declare class TokenService {
    private jwtService;
    private cache;
    private readonly logger;
    constructor(jwtService: JwtService, cache: any);
    generateTokenPair(userId: string, email: string, role: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    rotateRefreshToken(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    revokeTokenFamily(familyId: string): Promise<void>;
    revokeRefreshToken(jti: string): Promise<void>;
}
