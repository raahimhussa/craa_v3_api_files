import {
  UserTraining,
  UserTrainingSchema,
} from './schemas/userTraining.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TrainingModule from '../trainings/training.module';
import { UserTrainingsController } from './userTrainings.controller';
import UserTrainingsRepository from './userTrainings.repository';
import UserTrainingsService from './userTrainings.service';

@Module({
  imports: [
    TrainingModule,
    MongooseModule.forFeatureAsync([
      {
        name: UserTraining.name,
        useFactory: () => {
          const schema = UserTrainingSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [UserTrainingsController],
  providers: [UserTrainingsService, UserTrainingsRepository],
  exports: [UserTrainingsService, UserTrainingsRepository],
})
export default class UserTrainingsModule {}
