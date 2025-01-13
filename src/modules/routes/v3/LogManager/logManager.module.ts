import {
  AdminLog,
  AdminLogSchema,
} from '../../v2/adminLogs/schemas/adminLog.schema';
import {
  AuthLog,
  AuthLogSchema,
} from '../../v2/authLogs/schemas/authLog.schema';
import { User, UserSchema } from '../../v1/users/schemas/users.schema';

import AuthLogsModule from '../../v2/authLogs/authLogs.module';
import { LogManagerController } from './logManager.controller';
import LogManagerRepository from './logManager.repository';
import LogManagerService from './logManager.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UsersModule from '../../v1/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: AuthLog.name,
        schema: AuthLogSchema,
      },
      {
        name: AdminLog.name,
        schema: AdminLogSchema,
      },
    ]),
  ],
  controllers: [LogManagerController],
  providers: [LogManagerService, LogManagerRepository],
  exports: [LogManagerService, LogManagerRepository],
})
export default class LogManagerModule {}
