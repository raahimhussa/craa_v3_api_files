import { Strategy } from 'passport-local';
import { validate } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import {
  ValidationError,
  Injectable,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { ValidateUserOutput } from '../interfaces/validate-user-output.interface';
import AuthService from '../auth.service';

@Injectable()
export default class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'usernameOrEmail',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    req: ExpressRequest,
    usernameOrEmail: string,
    password: string,
    headers: any,
  ): Promise<ValidateUserOutput> {
    const errors = (await validate(req.body)) as ValidationError[];

    if (errors.length > 0) {
      throw errors;
    }
    let user = null;
    if (
      req.headers.origin === 'http://localhost:3000' ||
      req.headers.origin === 'https://craa-user-dev.hoansoft.com'
    ) {
      user = await this.authService.validateUser(usernameOrEmail, password);
    } else {
      user = await this.authService.switchUser(usernameOrEmail, password);
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
