import { AuthLog, AuthLogSchema } from './schemas/authLog.schema';

import { AuthLogsController } from './authLogs.controller';
import AuthLogsRepository from './authLogs.repository';
import AuthLogsService from './authLogs.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuthLog.name, schema: AuthLogSchema }]),
  ],
  controllers: [AuthLogsController],
  providers: [AuthLogsService, AuthLogsRepository],
  exports: [AuthLogsService, AuthLogsRepository],
})
export default class AuthLogsModule {}
