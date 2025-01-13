import { AdminLog, AdminLogSchema } from './schemas/adminLog.schema';

import { AdminLogsController } from './adminLogs.controller';
import AdminLogsRepository from './adminLogs.repository';
import AdminLogsService from './adminLogs.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminLog.name, schema: AdminLogSchema },
    ]),
  ],
  controllers: [AdminLogsController],
  providers: [AdminLogsService, AdminLogsRepository],
  exports: [AdminLogsService, AdminLogsRepository],
})
export default class AdminLogsModule {}
