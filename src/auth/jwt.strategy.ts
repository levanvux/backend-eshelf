import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '../../generated/prisma/enums';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: { sub: number; email: string; role: Role }) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
