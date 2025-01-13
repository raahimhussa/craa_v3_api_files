import {
  AssessmentType,
  AssessmentTypeSchema,
} from './schemas/assessmentType.schema';

import { AssessmentTypesController } from './assessmentTypes.controller';
import AssessmentTypesRepository from './assessmentTypes.repository';
import AssessmentTypesService from './assessmentTypes.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TrainingModule from '../../v2/trainings/training.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: AssessmentType.name,
        useFactory: () => {
          const schema = AssessmentTypeSchema;
          // schema.pre('save', function (doc) {
          // });
          return schema;
        },
      },
    ]),
    TrainingModule,
  ],
  controllers: [AssessmentTypesController],
  providers: [AssessmentTypesService, AssessmentTypesRepository],
  exports: [AssessmentTypesService, AssessmentTypesRepository],
})
export default class AssessmentTypesModule {}
