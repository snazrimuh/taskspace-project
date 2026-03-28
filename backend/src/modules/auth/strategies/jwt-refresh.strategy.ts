import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role?: 'ADMIN' | 'USER' | string;
  isSystemAdmin?: boolean;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const fromRefreshCookie = (req: any) => req?.cookies?.refresh_token || null;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromRefreshCookie,
      ]),
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const authHeader: string = req.get('authorization') || '';
    const bearer = authHeader.replace('Bearer', '').trim();
    const refreshToken = req?.cookies?.refresh_token || bearer;

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'USER',
      isSystemAdmin: payload.isSystemAdmin || false,
      refreshToken,
    };
  }
}
