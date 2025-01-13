import {
  AssessmentType,
  AssessmentTypeSchema,
} from '../../v1/assessmentTypes/schemas/assessmentType.schema';

import AssessmentTypesModule from '../../v1/assessmentTypes/assessmentTypes.module';
import AssessmentsModule from '../../v2/assessments/assessments.module';
import ClientUnitsModule from '../../v1/clientUnits/clientUnits.module';
import CountriesModule from '../../v1/countries/countries.module';
import DataDumpRepository from './dataDump.repository';
import { DataDumpsController } from './dataDump.controller';
import DataDumpsService from './dataDump.service';
import DomainsModule from '../../v2/domains/domains.module';
import FindingsModule from '../../v2/findings/findings.module';
import FoldersModule from '../../v2/folders/folders.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SimDocsModule from '../../v1/simDocs/simDocs.module';
import SimulationMappersModule from '../simulationMapper/simulationMappers.module';
import SimulationsModule from '../../v1/simulations/simulations.module';
import UserAssessmentCyclesModule from '../../v1/userAssessmentCycles/userAssessmentCycles.module';
import UserSimulationsModule from '../../v2/userSimulations/userSimulations.module';
import UserTrainingsModule from '../../v2/userTrainings/userTrainings.module';
import UsersModule from '../../v1/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssessmentType.name, schema: AssessmentTypeSchema },
    ]),
    FindingsModule,
    UsersModule,
    DomainsModule,
    UserSimulationsModule,
    UserTrainingsModule,
    UserAssessmentCyclesModule,
    ClientUnitsModule,
    CountriesModule,
    AssessmentTypesModule,
    SimulationsModule,
    SimDocsModule,
    FoldersModule,
    SimulationMappersModule,
    AssessmentsModule,
  ],
  controllers: [DataDumpsController],
  providers: [DataDumpsService, DataDumpRepository],
  exports: [DataDumpsService, DataDumpRepository],
})
export default class DataDumpModule {}
