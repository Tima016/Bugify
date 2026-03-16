import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, UnauthorizedException, Res, Req, Ip } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { VerifyTwoFactorDto, EnableTwoFactorDto } from './dto/two-factor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import * as Prisma from '@prisma/client';

const COOKIE_OPTIONS_BASE = {
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
};

// Strict rate limit for auth endpoints: 5 requests per 60 seconds
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Extract real IP (behind NGINX proxy)
        const clientIp = (req.headers['x-real-ip'] as string)
            || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
            || req.ip
            || 'unknown';

        const { user, accessToken, refreshToken } = await this.authService.login(loginDto, clientIp);

        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('access_token', accessToken, {
            ...COOKIE_OPTIONS_BASE,
            secure: isProd,
            maxAge: 10 * 60 * 1000, // 10 minutes (matches access token expiry)
        });

        res.cookie('refresh_token', refreshToken, {
            ...COOKIE_OPTIONS_BASE,
            secure: isProd,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return { user };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const tokens = await this.authService.refreshTokens(refreshToken);

        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('access_token', tokens.accessToken, {
            ...COOKIE_OPTIONS_BASE,
            secure: isProd,
            maxAge: 10 * 60 * 1000,
        });

        res.cookie('refresh_token', tokens.refreshToken, {
            ...COOKIE_OPTIONS_BASE,
            secure: isProd,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { message: 'Tokens refreshed' };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
        return { message: 'Logged out successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @GetUser() user: Prisma.User,
        @Body() changePasswordDto: { currentPassword: string; newPassword: string },
    ) {
        return this.authService.changePassword(user.id, changePasswordDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/enable')
    @HttpCode(HttpStatus.OK)
    async enableTwoFactor(@GetUser() user: Prisma.User) {
        return this.authService.enableTwoFactorFlow(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/disable')
    @HttpCode(HttpStatus.OK)
    async disableTwoFactor(@GetUser() user: Prisma.User) {
        await this.authService.disableTwoFactor(user.id);
        return { message: '2FA disabled successfully' };
    }
}
