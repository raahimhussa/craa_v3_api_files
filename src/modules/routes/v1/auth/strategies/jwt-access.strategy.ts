import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import authConstants from '../auth-constants';

import { JwtStrategyValidate } from '../interfaces/jwt-strategy-validate.interface';

@Injectable()
export default class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'accessToken',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConstants.jwt.secrets.accessToken,
    });
  }

  async validate(payload: any): Promise<JwtStrategyValidate> {
    return {
      _id: payload._id,
      email: payload.email,
      role: payload.role,
      username: payload.username,
    };
  }
}
