import { Training, TrainingSchema } from './schemas/training.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingsController } from './training.controller';
import TrainingsRepository from './training.repository';
import TrainingsService from './training.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
    ]),
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService, TrainingsRepository],
  exports: [TrainingsService, TrainingsRepository],
})
export default class TrainingModule {}
