import {
  UserSimulation,
  UserSimulationSchema,
} from './schemas/userSimulation.schema';

import AnswersModule from '../answers/answers.module';
import ClientUnitsModule from '../../v1/clientUnits/clientUnits.module';
import DomainsModule from '../domains/domains.module';
import FindingsModule from '../findings/findings.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UserAssessmentCyclesModule from '../../v1/userAssessmentCycles/userAssessmentCycles.module';
import { UserSimulationsController } from './userSimulations.controller';
import UserSimulationsRepository from './userSimulations.repository';
import UserSimulationsService from './userSimulations.service';
import UserTrainingsModule from '../userTrainings/userTrainings.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: UserSimulation.name,
        useFactory: () => {
          const schema = UserSimulationSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [UserSimulationsController],
  providers: [UserSimulationsService, UserSimulationsRepository],
  exports: [UserSimulationsService, UserSimulationsRepository],
})
export default class UserSimulationsModule {}
