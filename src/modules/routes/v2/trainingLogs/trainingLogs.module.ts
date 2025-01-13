import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingLogsController } from './trainingLogs';
import TrainingLogsRepository from './trainingLogs.repository';
import TrainingLogsService from './trainingLogs.service';
import { TrainingLog, TrainingLogSchema } from './schemas/trainingLogs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingLog.name, schema: TrainingLogSchema },
    ]),
  ],
  controllers: [TrainingLogsController],
  providers: [TrainingLogsService, TrainingLogsRepository],
  exports: [TrainingLogsService, TrainingLogsRepository],
})
export default class TrainingLogsModule {}
