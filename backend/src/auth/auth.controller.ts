import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, UnauthorizedException, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { VerifyTwoFactorDto, EnableTwoFactorDto } from './dto/two-factor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import * as Prisma from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { user, accessToken, refreshToken } = await this.authService.login(loginDto);

        // precise cookie settings
        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
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
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { message: 'Tokens refreshed' };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
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
