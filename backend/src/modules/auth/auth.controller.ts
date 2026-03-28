import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private cookieOptions(maxAge: number) {
    return {
      domain: process.env.COOKIE_DOMAIN || '.rizan.app',
      path: process.env.COOKIE_PATH || '/',
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
      maxAge,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  // --- LOCAL AUTH DISABLED (Managed by Portal Hub) ---
  /*
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);

    res.cookie('access_token', result.accessToken, this.cookieOptions(60 * 60 * 1000));
    res.cookie('refresh_token', result.refreshToken, this.cookieOptions(7 * 24 * 60 * 60 * 1000));

    return { user: result.user };
  }
  */

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);

    const clearOptions = {
      domain: process.env.COOKIE_DOMAIN || '.rizan.app',
      path: process.env.COOKIE_PATH || '/',
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
    };
    res.clearCookie('access_token', clearOptions);
    res.clearCookie('refresh_token', clearOptions);

    return { message: 'Logged out' };
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser('id') userId: string,
    @CurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(userId, refreshToken);

    res.cookie('access_token', result.accessToken, this.cookieOptions(60 * 60 * 1000));
    res.cookie('refresh_token', result.refreshToken, this.cookieOptions(7 * 24 * 60 * 60 * 1000));

    return { refreshed: true };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
