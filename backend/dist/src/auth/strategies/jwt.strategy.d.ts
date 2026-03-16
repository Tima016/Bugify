import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService, configService: ConfigService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        profilePictureUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        reputationScore: number;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        twoFactorEnabled: boolean;
        companyId: string | null;
    }>;
}
export {};
