import {
  UserAssessmentCycle,
  UserAssessmentCycleSchema,
} from './schemas/userAssessmentCycle.schema';
import {
  UserAssessmentCycleSummary,
  UserAssessmentCycleSummarySchema,
} from './schemas/userAssessmentCycleSummary.schema';

import AssessmentsModule from '../../v2/assessments/assessments.module';
import ClientUnitsModule from '../clientUnits/clientUnits.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchemasModule } from 'src/modules/schemas/schemas.modules';
import UserAssessmentCycleSummariesRepository from './userAssessmentCycleSummaries.repository';
import { UserAssessmentCyclesController } from './userAssessmentCycles.controller';
import UserAssessmentCyclesRepository from './userAssessmentCycles.repository';
import { UserAssessmentCyclesService } from './userAssessmentCycles.service';
import UserSimulationsModule from '../../v2/userSimulations/userSimulations.module';
import UserTrainingsModule from '../../v2/userTrainings/userTrainings.module';
import UsersModule from '../users/users.module';

// import UsersModule from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAssessmentCycle.name, schema: UserAssessmentCycleSchema },
      {
        name: UserAssessmentCycleSummary.name,
        schema: UserAssessmentCycleSummarySchema,
      },
    ]),
    ClientUnitsModule,
    UserSimulationsModule,
    UserTrainingsModule,
  ],
  controllers: [UserAssessmentCyclesController],
  providers: [
    UserAssessmentCyclesService,
    UserAssessmentCyclesRepository,
    UserAssessmentCycleSummariesRepository,
  ],
  exports: [
    UserAssessmentCyclesService,
    UserAssessmentCyclesRepository,
    UserAssessmentCycleSummariesRepository,
  ],
})
export default class UserAssessmentCyclesModule {}
