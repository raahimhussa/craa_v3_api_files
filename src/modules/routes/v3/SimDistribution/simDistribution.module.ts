import {
  UserAssessmentCycle,
  UserAssessmentCycleSchema,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycle.schema';
import {
  UserAssessmentCycleSummary,
  UserAssessmentCycleSummarySchema,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycleSummary.schema';

import AnswersModule from '../../v2/answers/answers.module';
import AssessmentsModule from '../../v2/assessments/assessments.module';
import ClientUnitsModule from '../../v1/clientUnits/clientUnits.module';
import DomainsModule from '../../v2/domains/domains.module';
import FindingsModule from '../../v2/findings/findings.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotesModule from '../../v2/notes/notes.module';
import { SimDistributionController } from './simDistribution.controller';
import SimDistributionRepository from './simDistribution.repository';
import SimDistributionService from './simDistribution.service';
import UserAssessmentCyclesModule from '../../v1/userAssessmentCycles/userAssessmentCycles.module';
import UserSimulationsModule from '../../v2/userSimulations/userSimulations.module';
import UserTrainingsModule from '../../v2/userTrainings/userTrainings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserAssessmentCycleSummary.name,
        schema: UserAssessmentCycleSummarySchema,
      },
    ]),
    UserSimulationsModule,
    AssessmentsModule,
    ClientUnitsModule,
    UserAssessmentCyclesModule,
    DomainsModule,
    UserTrainingsModule,
    AnswersModule,
    FindingsModule,
    NotesModule,
  ],
  controllers: [SimDistributionController],
  providers: [SimDistributionService, SimDistributionRepository],
  exports: [SimDistributionService, SimDistributionRepository],
})
export default class SimDistributionModule {}
