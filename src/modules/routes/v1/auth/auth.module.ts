import AuthController from './auth.controller';
import AuthLogsModule from '../../v2/authLogs/authLogs.module';
import AuthRepository from './auth.repository';
import AuthService from './auth.service';
import { ConfigService } from '@nestjs/config';
import JwtAccessStrategy from './strategies/jwt-access.strategy';
import { JwtModule } from '@nestjs/jwt';
import JwtRefreshStrategy from './strategies/jwt-refresh.strategy';
import JwtWSAccessStrategy from './strategies/jwt-ws-access.strategy';
import LocalStrategy from './strategies/local.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import RolesModule from '../roles/roles.module';
import UsersModule from '../users/users.module';
import authConstants from './auth-constants';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule,
    AuthLogsModule,
    JwtModule.register({
      secret: authConstants.jwt.secret,
    }),
  ],
  providers: [
    AuthController,
    ConfigService,
    AuthService,
    LocalStrategy,
    AuthRepository,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtWSAccessStrategy,
  ],
  controllers: [AuthController],
})
export default class AuthModule {}
