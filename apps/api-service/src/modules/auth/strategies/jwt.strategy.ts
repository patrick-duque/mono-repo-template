import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UnauthorizedException } from 'common/exceptions';

import { JwtPayloadSchema, type JwtPayload } from '../dtos';
import { TokenExpiredException } from '../exceptions';

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: unknown): JwtPayload {
    const parsed = JwtPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      throw new UnauthorizedException();
    }

    if (
      typeof parsed.data.exp === 'number' &&
      Math.floor(Date.now() / 1000) > parsed.data.exp
    ) {
      throw new TokenExpiredException();
    }

    return parsed.data;
  }
}
