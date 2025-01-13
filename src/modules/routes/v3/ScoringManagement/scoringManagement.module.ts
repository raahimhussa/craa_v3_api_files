import {
  Assessment,
  AssessmentSchema,
} from '../../v2/assessments/schemas/assessment.schema';
import {
  AssessmentType,
  AssessmentTypeSchema,
} from '../../v1/assessmentTypes/schemas/assessmentType.schema';
import {
  UserAssessmentCycle,
  UserAssessmentCycleSchema,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycle.schema';
import {
  UserSimulation,
  UserSimulationSchema,
} from '../../v2/userSimulations/schemas/userSimulation.schema';

import AnswersModule from '../../v2/answers/answers.module';
import AssessmentsModule from '../../v2/assessments/assessments.module';
import ClientUnitsModule from '../../v1/clientUnits/clientUnits.module';
import DomainsModule from '../../v2/domains/domains.module';
import FindingsModule from '../../v2/findings/findings.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScoringManagementController } from './scoringManagement.controller';
import ScoringManagementRepository from './scoringManagement.repository';
import ScoringManagementService from './scoringManagement.service';
import UserAssessmentCyclesModule from '../../v1/userAssessmentCycles/userAssessmentCycles.module';
import UserSimulationsModule from '../../v2/userSimulations/userSimulations.module';
import UserTrainingsModule from '../../v2/userTrainings/userTrainings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: UserSimulation.name, schema: UserSimulationSchema },
      { name: AssessmentType.name, schema: AssessmentTypeSchema },
      { name: UserAssessmentCycle.name, schema: UserAssessmentCycleSchema },
    ]),
    UserSimulationsModule,
    AssessmentsModule,
    ClientUnitsModule,
    UserAssessmentCyclesModule,
    DomainsModule,
    UserTrainingsModule,
    AnswersModule,
    FindingsModule,
  ],
  controllers: [ScoringManagementController],
  providers: [ScoringManagementService, ScoringManagementRepository],
  exports: [ScoringManagementService, ScoringManagementRepository],
})
export default class SimManagementModule {}
