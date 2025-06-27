import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }
//Si la verificación falla (firma inválida, token expirado, etc.), Passport lanza un error y el proceso se detiene.
//Si la verificación tiene éxito, Passport decodifica el token y pasa el payload (los datos del token) a tu método validate.

  async validate(payload: any) {
    // Aquí defines qué datos del token quieres poner en req.user
    if (!payload.sub) {
        throw new UnauthorizedException();
      }
    return { sub: payload.sub, email: payload.email };
  }
} 