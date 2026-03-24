import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '../generated/prisma/client.js';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: { sub: number; name: string; email: string; role: Role }) {
    return {
      userId: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  }
}
