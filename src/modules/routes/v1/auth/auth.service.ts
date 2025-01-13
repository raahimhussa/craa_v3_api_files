import * as bcrypt from 'bcrypt';

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserDocument } from '../users/schemas/users.schema';

import { AuthLogType } from '../../v2/authLogs/schemas/authLog.schema';
import AuthLogsRepository from '../../v2/authLogs/authLogs.repository';
import AuthRepository from './auth.repository';
import { DecodedUser } from './interfaces/decoded-user.interface';
import { JwtService } from '@nestjs/jwt';
import JwtTokensDto from './dto/jwt-tokens.dto';
import { LoginPayload } from './interfaces/login-payload.interface';
import RolesRepository from '../roles/roles.repository';
import { UserInterface } from '../users/interfaces/user.interface';
import UsersRepository from '../users/users.repository';
import { Utils } from 'src/utils/utils';
import authConstants from './auth-constants';

@Injectable()
export default class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly roleRepository: RolesRepository,
    private readonly authLogsRepository: AuthLogsRepository,
  ) {}

  public async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<null | UserInterface> {
    let user: any = null;

    const isEmail = Utils.validateEmail(usernameOrEmail);

    const methodName = isEmail ? 'getUserByEmail' : 'getUserByUsername';

    try {
      user = (await this.usersRepository[methodName](
        usernameOrEmail,
      )) as UserDocument;
    } catch (error) {
      console.error(error);
    }

    if (!user) {
      throw new NotFoundException(
        'The user does not exist and email is not verified',
      );
    }

    const passwordCompared = await bcrypt.compare(password, user.password);

    if (passwordCompared) {
      return user;
    }
    throw new UnauthorizedException('Passwords do not match.');
  }
  public async switchUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<null | UserInterface> {
    let user: any = null;

    const isEmail = Utils.validateEmail(usernameOrEmail);

    const methodName = isEmail ? 'getUserByEmail' : 'getUserByUsername';

    try {
      user = (await this.usersRepository[methodName](
        usernameOrEmail,
      )) as UserDocument;
    } catch (error) {
      console.error(error);
    }

    if (!user) {
      throw new NotFoundException(
        'The user does not exist and email is not verified',
      );
    }
    return user;
  }

  public async login(
    data: LoginPayload,
    ip: string,
    userAgent: any,
  ): Promise<JwtTokensDto> {
    if (!(data as any)?.isActivated) {
      throw 'This account is not activated';
    }
    try {
      const payloadData = {
        _id: data._id,
        email: data.email,
        name: data.name,
        roleId: data.roleId,
        profileId: data.profileId,
        //@ts-ignore
        authority: data.authority,
      };
      const tokenData = {
        _id: data._id,
        email: data.email,
      };

      const payload: LoginPayload = payloadData;

      const accessToken = this.jwtService.sign(tokenData, {
        expiresIn: authConstants.jwt.expirationTime.accessToken,
        secret: authConstants.jwt.secrets.accessToken,
      });

      const refreshToken = this.jwtService.sign(tokenData, {
        expiresIn: authConstants.jwt.expirationTime.refreshToken,
        secret: authConstants.jwt.secrets.refreshToken,
      });

      await this.authRepository.addRefreshToken(
        payload.name as string,
        refreshToken,
      );

      const role = await this.roleRepository.find({
        filter: { _id: data.roleId },
      });
      const user = await this.usersRepository.findOne({
        filter: {
          _id: data._id,
        },
      });
      //@ts-ignore
      const otp_enabled = data.otpData?.otp_enabled;
      //@ts-ignore
      const otp_verified = data.otpData?.otp_verified;
      const user_id = data._id;
      //@ts-ignore

      const fetch = require('node-fetch');
      const _geolocation = await fetch(`http://ip-api.com/json/${ip}`);
      // const _geolocation = await fetch(`http://ip-api.com/json/24.48.0.1`);
      const geolocation = await _geolocation.json();

      // authLog - signin
      const authLogDAO = {
        type: AuthLogType.SignIn,
        userId: data._id,
        role: role[0].title,
        userName: `${user?.profile?.firstName || ''} ${
          user?.profile?.lastName || ''
        }`,
        os: `${userAgent?.os?.name || ''} ${userAgent?.os?.version || ''}`,
        browser: `${userAgent?.browser?.name || ''} ${
          userAgent?.browser?.version || ''
        }`,
        ip,
        country: ip === '::1' ? 'local' : geolocation.country,
        city: ip === '::1' ? 'local' : geolocation.city,
        isp: ip === '::1' ? 'local' : geolocation.isp,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      authLogDAO.userId && (await this.authLogsRepository.create(authLogDAO));

      return {
        accessToken,
        refreshToken,
        //@ts-ignore
        otp_enabled,
        //@ts-ignore
        otp_verified,
        user_id,
        role: role[0].title,
      };
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public getRefreshTokenByEmail(email: string): Promise<string | null> {
    return this.authRepository.getToken(email);
  }

  public deleteTokenByEmail(email: string): Promise<number> {
    return this.authRepository.removeToken(email);
  }

  public deleteAllTokens(): Promise<string> {
    return this.authRepository.removeAllTokens();
  }

  public async createVerifyToken(tokenPayload: any, host: string) {
    const token = this.jwtService.sign(tokenPayload, {
      expiresIn: authConstants.jwt.expirationTime.accessToken,
      secret: authConstants.jwt.secrets.accessToken,
    });
    await this.usersRepository.updateOne({
      filter: {
        _id: tokenPayload._id,
      },
      update: {
        $set: {
          emailVerificationLink: `${host}/auth/password-generator/${token}`,
        },
      },
    });
    return token;
  }

  public async passwordResetToken(tokenPayload: any, host: string) {
    const token = this.jwtService.sign(tokenPayload, {
      expiresIn: authConstants.jwt.expirationTime.accessToken,
      secret: authConstants.jwt.secrets.accessToken,
    });
    await this.usersRepository.updateOne({
      filter: {
        _id: tokenPayload._id,
      },
      update: {
        $set: {
          passwordResetToken: token,
        },
      },
    });
    return token;
  }

  public verifyEmailVerToken(token: string, secret: string) {
    return this.jwtService.verifyAsync(token, { secret });
  }

  public async verifyToken(
    token: string,
    secret: string,
  ): Promise<DecodedUser | null> {
    try {
      const user = (await this.jwtService.verifyAsync(token, {
        secret,
      })) as DecodedUser | null;
      return user;
    } catch (error) {
      return null;
    }
  }
}
