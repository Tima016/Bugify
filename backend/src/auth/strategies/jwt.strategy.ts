import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any) => {
                    return request?.cookies?.access_token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
        });
    }

    async validate(payload: any) {
        console.log('[JwtStrategy] Validating payload:', payload);
        const user = await this.authService.validateUser(payload.sub);
        if (!user) {
            console.error('[JwtStrategy] User not found for ID:', payload.sub);
        } else {
            console.log('[JwtStrategy] User validated:', user.id);
        }
        return user;
    }
}
