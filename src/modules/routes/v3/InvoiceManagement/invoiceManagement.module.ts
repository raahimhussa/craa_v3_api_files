import {
  UserAssessmentCycle,
  UserAssessmentCycleSchema,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycle.schema';
import {
  UserAssessmentCycleSummary,
  UserAssessmentCycleSummarySchema,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycleSummary.schema';
import {
  UserSimulation,
  UserSimulationSchema,
} from '../../v2/userSimulations/schemas/userSimulation.schema';

import AnswersModule from '../../v2/answers/answers.module';
import AssessmentsModule from '../../v2/assessments/assessments.module';
import ClientUnitsModule from '../../v1/clientUnits/clientUnits.module';
import DomainsModule from '../../v2/domains/domains.module';
import FindingsModule from '../../v2/findings/findings.module';
import { InvoiceManagementController } from './invoiceManagement.controller';
import InvoiceManagementRepository from './invoiceManagement.repository';
import InvoiceManagementService from './invoiceManagement.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotesModule from '../../v2/notes/notes.module';
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
  controllers: [InvoiceManagementController],
  providers: [InvoiceManagementService, InvoiceManagementRepository],
  exports: [InvoiceManagementService, InvoiceManagementRepository],
})
export default class InvoiceManagementModule {}
