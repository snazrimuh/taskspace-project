import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role?: 'ADMIN' | 'USER' | string;
  isSystemAdmin?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const accessSecret =
      configService.get<string>('HUB_JWT_ACCESS_SECRET') ||
      configService.get<string>('JWT_ACCESS_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['access_token'];
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: accessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const role = payload.role || (payload.isSystemAdmin ? 'ADMIN' : 'USER');
    const user = await this.authService.validateUserFromSSO(
      payload.email,
      payload.sub,
      role,
    );
    return user;
  }
}
