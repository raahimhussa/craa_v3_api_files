import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Patch,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  Ip,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import {
  ApiBadRequestResponse,
  // ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import authConstants from './auth-constants';
import { DecodedUser } from './interfaces/decoded-user.interface';
import RefreshTokenDto from './dto/refresh-token.dto';
import AuthService from './auth.service';
import LocalAuthGuard from './guards/local-auth.guard';
import UsersService from '../users/users.service';
import JwtAccessGuard from 'src/common/guards/jwt-access.guard';
import RolesGuard from 'src/common/guards/roles.guard';
import { Roles, RolesEnum } from 'src/common/decorators/roles.decorator';
import AuthBearer from 'src/common/decorators/auth-bearer.decorator';
import SignUpDto from './dto/sign-up.dto';
import SignInDto from './dto/sign-in.dto';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/schemas/roles.schema';

import { URLS, Emails } from 'src/utils/constants';
@ApiTags('Auth')
@Controller()
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly rolesService: RolesService,
  ) {}

  @ApiBody({ type: SignInDto })
  @ApiOkResponse({ description: 'Returns jwt tokens' })
  @ApiBadRequestResponse({ description: '400. ValidationException' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Req() req: any, @Body('ip') ip) {
    try {
      // console.log(req.rawHeaders);
      // console.log(req.headers);
      // console.log(req.connection.remoteAddress);
      // const ip = req.connection.remoteAddress;
      const parser = require('ua-parser-js');
      const userAgent = parser(req.headers['user-agent']);
      // console.log({ ip, userAgent });
      // const options = {
      //   path: '/8.8.8.8/json/',
      //   host: 'ipapi.co',
      //   port: 443,
      //   headers: { 'User-Agent': 'nodejs-ipapi-v1.02' },
      // };
      // const fetch = require('node-fetch');
      // const response = await fetch(`https://ipapi.co/49.196.56.118/json`);
      // const ipData = await response.json();

      const user = await this.authService.login(req.user, ip, userAgent);
      return user;
    } catch (e) {
      console.error(e);
    }
  }

  @ApiOkResponse({ description: '201, Success' })
  @ApiBadRequestResponse({ description: '400. ValidationException' })
  @ApiConflictResponse({ description: '409. ConflictResponse' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @ApiBody({ type: SignUpDto })
  @HttpCode(HttpStatus.CREATED)
  @Patch('signup')
  async activate(@Body() user: any): Promise<any> {
    return await this.usersService.activate(user);
  }

  @ApiOkResponse({ description: '201, Success' })
  @ApiBadRequestResponse({ description: '400. ValidationException' })
  @ApiConflictResponse({ description: '409. ConflictResponse' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @ApiBody({ type: SignUpDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() user: any): Promise<any> {
    return await this.usersService.create(user);
  }

  @ApiOkResponse({ description: '200, returns new jwt tokens' })
  @ApiUnauthorizedResponse({ description: '401. Token has been expired' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError ' })
  @ApiBearerAuth()
  @Post('refreshToken')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: any,
  ) {
    const decodedUser = this.jwtService.decode(
      refreshTokenDto.refreshToken,
    ) as DecodedUser;

    if (!decodedUser) {
      throw new ForbiddenException('Incorrect token');
    }

    const oldRefreshToken: string | null =
      await this.authService.getRefreshTokenByEmail(decodedUser.email);

    // if the old refresh token is not equal to request refresh token then this user is unauthorized
    if (!oldRefreshToken || oldRefreshToken !== refreshTokenDto.refreshToken) {
      throw new UnauthorizedException(
        'Authentication credentials were missing or incorrect',
      );
    }

    const ip = req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const payload = {
      _id: decodedUser._id,
      email: decodedUser.email,
      name: decodedUser.name,
      roleId: decodedUser.roleId,
      profileId: decodedUser.profileId,
    };

    return await this.authService.login(payload, ip, userAgent);
  }

  @ApiNoContentResponse({ description: 'No content. 204' })
  @ApiNotFoundResponse({ description: 'User was not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('verify/:token')
  async verifyUser(@Param('token') token: string) {
    const { _id } = await this.authService.verifyEmailVerToken(
      token,
      authConstants.jwt.secrets.accessToken,
    );

    const foundUser: any = await this.usersService.getUnverifiedUserById(_id);

    if (!foundUser) {
      throw new NotFoundException('The user does not exist');
    }
    const body = {
      filter: { _id: foundUser._id },
      update: { verified: true },
    };
    return await this.usersService.update(body);
  }

  @ApiNoContentResponse({ description: 'no content' })
  @ApiUnauthorizedResponse({ description: 'Token has been expired' })
  @ApiInternalServerErrorResponse({ description: 'InternalServerError' })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Delete('logout/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Param('token') token: string): Promise<null> {
    const decodedUser: DecodedUser | null = await this.authService.verifyToken(
      token,
      authConstants.jwt.secrets.accessToken,
    );

    if (!decodedUser) {
      throw new ForbiddenException('Incorrect token');
    }

    const deletedUsersCount = await this.authService.deleteTokenByEmail(
      decodedUser.email,
    );

    if (deletedUsersCount === 0) {
      throw new NotFoundException();
    }

    await this.usersService.update({
      filter: {
        _id: decodedUser._id,
      },
      update: {
        'status.online': false,
        'status.logoutAt': new Date(),
      },
    });
    return null;
  }

  @ApiNoContentResponse({ description: 'no content' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @ApiBearerAuth()
  @Delete('logoutAll')
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(): Promise<null> {
    this.authService.deleteAllTokens();
    return null;
  }

  @ApiOkResponse({
    description: '200, returns a decoded user from access token',
  })
  @ApiUnauthorizedResponse({ description: '403, says you Unauthorized' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Get('token')
  async getUserByAccessToken(@AuthBearer() token: string): Promise<any> {
    const decodedUser: DecodedUser | null = await this.authService.verifyToken(
      token,
      authConstants.jwt.secrets.accessToken,
    );

    if (!decodedUser) {
      throw new ForbiddenException('Incorrect token');
    }

    const user = await this.usersService.find({
      filter: {
        _id: decodedUser._id,
      },
    });
    return user;
  }

  @Post('verifyEmail')
  async verifyEmail(@Body() tokenPayload: any) {
    let host = URLS.Dev.APP;

    if (process.env.NODE_ENV === 'development') {
      host = URLS.Local.APP;
    }

    const email = tokenPayload.email || Emails.SuperAdmin;
    const token = await this.authService.createVerifyToken(tokenPayload, host);

    if (tokenPayload.isDemo) {
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        from: Emails.SMTPSender,
        subject: authConstants.mailer.verifyEmail.subject,
        template: `${process.cwd()}/src/templates/verify-password`,
        context: {
          token,
          email,
          host,
        },
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  @Post('forgot-password')
  async requestPasswordReset(@Body() forgotPasswordUser: { email: string }) {
    if (!forgotPasswordUser) {
      return {
        success: false,
        message: 'Something went wrong. Please try again later.',
      };
    } else {
      const user = await this.usersService.getVerifiedUserByEmail(
        forgotPasswordUser.email,
      ); // Assuming you have a method to find user by email

      // console.log(user);

      if (!user) {
        return {
          success: false,
          message: 'User with that email does not exist',
        };
      }

      const payload = { email: user.email, _id: user._id };
      // const token = this.jwtService.sign(payload);

      let host = URLS.Dev.APP;

      if (process.env.NODE_ENV === 'development') {
        host = URLS.Local.APP;
      }

      console.log('requestPasswordReset host => ', process.env.NODE_ENV, host);

      const email = forgotPasswordUser.email || Emails.SuperAdmin;
      const token = await this.authService.passwordResetToken(payload, host);

      try {
        await this.mailerService.sendMail({
          to: email,
          from: Emails.SMTPSender,
          subject: authConstants.mailer.resetPassword.subject,
          template: `${process.cwd()}/src/templates/reset-password`,
          context: {
            token,
            email,
            host,
          },
        });
      } catch (e) {
        console.error('requestPasswordReset => ', e);
        throw e;
      }

      return {
        success: true,
        message: 'Password reset link has been sent to your email',
      };
    }
  }
  @Post('resetPassword')
  async resetPasswordRequest(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    // Decode the token to extract the payload
    const decodedToken: any = this.jwtService.decode(token);

    // Extract the ID from the payload
    const userId = decodedToken._id;

    // Find the user by the extracted ID
    const user = await this.usersService.getVerifiedUserById(userId);

    if (!user) {
      throw new Error('Invalid token');
    }

    const passwordSaved = await this.usersService.updatePassword(
      userId,
      password,
    );

    if (passwordSaved) {
      return {
        success: true,
        message: 'Password has been reset successfully.',
      };
    } else {
      return {
        success: false,
        message: 'Something went wrong. Please try again later.',
      };
    }
  }
}
