import { ExcelController } from './excel.controller';
import ExcelService from './excel.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import LogsService from '../../v2/logs/logs.service';
import LogsModule from '../../v2/logs/logs.module';
import UsersModule from '../../v1/users/users.module';
import TrainingLogsModule from '../../v2/trainingLogs/trainingLogs.module';
import NotesModule from '../../v2/notes/notes.module';

@Module({
  imports: [LogsModule, UsersModule, TrainingLogsModule, NotesModule],
  controllers: [ExcelController],
  providers: [ExcelService, LogsService],
  exports: [ExcelService, LogsService],
})
export default class ExcelModule {}
