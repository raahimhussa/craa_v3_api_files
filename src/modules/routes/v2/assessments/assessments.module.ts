import { Assessment, AssessmentSchema } from './schemas/assessment.schema';

import AnswersModule from '../answers/answers.module';
import { AssessmentsController } from './assessments.controller';
import AssessmentsRepository from './assessments.repository';
import AssessmentsService from './assessments.service';
import DomainsModule from '../domains/domains.module';
import FindingsModule from '../findings/findings.module';
import FoldersModule from '../folders/folders.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotesModule from '../notes/notes.module';
import SettingsModule from '../settings/settings.module';
import SimDocsModule from '../../v1/simDocs/simDocs.module';
import SimulationMappersModule from '../../v3/simulationMapper/simulationMappers.module';
import SimulationsModule from '../../v1/simulations/simulations.module';
import UserAssessmentCyclesModule from '../../v1/userAssessmentCycles/userAssessmentCycles.module';
import UserSimulationsModule from '../userSimulations/userSimulations.module';
import UserTrainingsModule from '../userTrainings/userTrainings.module';

// Original 'find' not working, this is part of the quick-n-dirtry workaround for now.
// See assessments.repository
import UsersModule from '../../v1/users/users.module';

import { UserSimulation, UserSimulationSchema } from '../userSimulations/schemas/userSimulation.schema';
import { User, UserSchema } from '../../v1/users/schemas/users.schema';
import { Simulation, SimulationSchema } from '../../v1/simulations/schemas/simulation.schema';

@Module({
  imports: [
    SettingsModule,
    FindingsModule,
    AnswersModule,
    UserSimulationsModule,
    UserTrainingsModule,
    SimulationsModule,
    SimDocsModule,
    FoldersModule,
    UserSimulationsModule,
    UserAssessmentCyclesModule,
    DomainsModule,
    NotesModule,
    SimulationMappersModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: UserSimulation.name, schema: UserSimulationSchema },
      { name: User.name, schema: UserSchema },
      { name: Simulation.name, schema: SimulationSchema },
    ]),
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AssessmentsRepository],
  exports: [AssessmentsService, AssessmentsRepository],
})
export default class AssessmentsModule {}
