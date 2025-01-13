import {
  AssessmentType,
  AssessmentTypeSchema,
} from '../../v1/assessmentTypes/schemas/assessmentType.schema';
import { Demo_Assessment, Demo_AssessmentSchema } from './schemas/assessments';
import { Demo_Client, Demo_ClientSchema } from './schemas/clients';
import {
  Demo_ComplianceNoteSchema,
  Demo_ComplianceNotes,
} from './schemas/complianceNotes';
import { Demo_Document, Demo_DocumentSchema } from './schemas/documents';
import {
  Demo_DocumentFolder,
  Demo_DocumentFolderSchema,
} from './schemas/docuemntFolders';
import { Demo_DomainTips, Demo_DomainTipsSchema } from './schemas/domainTips';
import { Demo_Finding, Demo_FindingSchema } from './schemas/findings';
import {
  Demo_FindingsSelected,
  Demo_FindingsSelectedSchema,
} from './schemas/findingsSelected';
import {
  Demo_MonitoringNoteSchema,
  Demo_MonitoringNotes,
} from './schemas/monitoringNotes';
import {
  Demo_ScoringAdjudication,
  Demo_ScoringAdjudicationSchema,
} from './schemas/scoringAdjudication';
import {
  Demo_ScoringBehaviorSchema,
  Demo_ScoringBehaviors,
} from './schemas/scoringBehaviors';
import {
  Demo_SimUsersSummary,
  Demo_SimUsersSummarySchema,
} from './schemas/simUsersSummary';
import {
  Demo_SimUsersSummaryAbbvie,
  Demo_SimUsersSummaryAbbvieSchema,
} from './schemas/simUsersSummaryAbbvie';
import {
  Demo_SimUsersSummaryAllucent,
  Demo_SimUsersSummaryAllucentSchema,
} from './schemas/simUsersSummaryAllucent';
import {
  Demo_SimUsersSummaryPfizer,
  Demo_SimUsersSummaryPfizerSchema,
} from './schemas/simUsersSummaryPfizer';
import {
  Demo_SimUsersSummaryPharmOlam,
  Demo_SimUsersSummaryPharmOlamSchema,
} from './schemas/simUsersSummaryPharmOlam';
import {
  Demo_SimUsersSummarySyneos,
  Demo_SimUsersSummarySyneosSchema,
} from './schemas/simUsersSummarySyneos';
import {
  Demo_SimulationSetting,
  Demo_SimulationSettingSchema,
} from './schemas/simulationSettings';
import {
  Demo_TempTimerLog,
  Demo_TempTimerLogSchema,
} from './schemas/tempTimerLog';
import {
  Demo_TrainingModule,
  Demo_TrainingModuleSchema,
} from './schemas/trainingModules';
import {
  Demo_TrainingModulePage,
  Demo_TrainingModulePageSchema,
} from './schemas/trainingModulePages';
import {
  Demo_TrainingModuleScoreSummary,
  Demo_TrainingModuleScoreSummarySchema,
} from './schemas/trainingModuleScoreSummary';
import {
  Demo_TrainingStatusSummary,
  Demo_TrainingStatusSummarySchema,
} from './schemas/trainingStatusSummary';
import { Demo_User, Demo_UserSchema } from './schemas/users.schema';
import { Demo_UserStatus, Demo_UserStatusSchema } from './schemas/usersStatus';
import {
  Demo_UserStatusAbbvie,
  Demo_UserStatusAbbvieSchema,
} from './schemas/usersStatusAbbvie';
import {
  Demo_UserStatusAllucent,
  Demo_UserStatusAllucentSchema,
} from './schemas/usersStatusAllucent';
import {
  Demo_UserStatusPfizer,
  Demo_UserStatusPfizerSchema,
} from './schemas/usersStatusPfizer';
import {
  Demo_UserStatusPharmOlam,
  Demo_UserStatusPharmOlamSchema,
} from './schemas/usersStatusPharmOlam';
import {
  Demo_UserStatusSyneos,
  Demo_UserStatusSyneosSchema,
} from './schemas/usersStatusSyneos';
import {
  Demo_UserSummary,
  Demo_UserSummarySchema,
} from './schemas/usersSummary';
import {
  Demo_UserSummaryAbbvie,
  Demo_UserSummaryAbbvieSchema,
} from './schemas/usersSummaryAbbvie';
import {
  Demo_UserSummaryAllucent,
  Demo_UserSummaryAllucentSchema,
} from './schemas/usersSummaryAllucent';
import {
  Demo_UserSummaryPfizer,
  Demo_UserSummaryPfizerSchema,
} from './schemas/usersSummaryPfizer';
import {
  Demo_UserSummaryPharmOlam,
  Demo_UserSummaryPharmOlamSchema,
} from './schemas/usersSummaryPharmOlam';
import {
  Demo_UserSummarySyneos,
  Demo_UserSummarySyneosSchema,
} from './schemas/usersSummarySyneos';
import {
  Demo_UsersDemographic,
  Demo_UsersDemographicSchema,
} from './schemas/usersDemographic';
import {
  Demo_UsersScoreSummary,
  Demo_UsersScoreSummarySchema,
} from './schemas/usersScoreSummary';
import { MongooseModule, Schema, SchemaFactory } from '@nestjs/mongoose';

import AnswersModule from '../../v2/answers/answers.module';
import AssessmentCyclesModule from '../../v1/assessmentCycles/assessmentCycles.module';
import AssessmentTypesModule from '../../v1/assessmentTypes/assessmentTypes.module';
import AssessmentsModule from '../../v2/assessments/assessments.module';
import ClientUnitsModule from '../../v1/clientUnits/clientUnits.module';
import ConnectFindingGroupsModule from '../connectFindingGroup/connectFindingGroups.module';
import CountriesModule from '../../v1/countries/countries.module';
import DomainsModule from '../../v2/domains/domains.module';
import FindingGroupsModule from '../findingGroup/findingGroups.module';
import FindingsModule from '../../v2/findings/findings.module';
import FoldersModule from '../../v2/folders/folders.module';
import KeyConceptsModule from '../../v2/keyConcepts/keyConcepts.module';
import Migration2Repository from './migration2.repository';
import MigrationRepository from './migration.repository';
import { MigrationsController } from './migration.controller';
import MigrationsService from './migration.service';
import { Module } from '@nestjs/common';
import NotesModule from '../../v2/notes/notes.module';
import RolesModule from '../../v1/roles/roles.module';
import SettingsModule from '../../v2/settings/settings.module';
import SimDocsModule from '../../v1/simDocs/simDocs.module';
import SimulationMappersModule from '../simulationMapper/simulationMappers.module';
import SimulationsModule from '../../v1/simulations/simulations.module';
import TrainingModule from '../../v2/trainings/training.module';
import UserAssessmentCyclesModule from '../../v1/userAssessmentCycles/userAssessmentCycles.module';
import UserSimulationsModule from '../../v2/userSimulations/userSimulations.module';
import UserTrainingsModule from '../../v2/userTrainings/userTrainings.module';
import UsersModule from '../../v1/users/users.module';

@Module({
  imports: [
    AssessmentsModule,
    FindingsModule,
    UsersModule,
    DomainsModule,
    UserSimulationsModule,
    TrainingModule,
    UserTrainingsModule,
    UserAssessmentCyclesModule,
    ClientUnitsModule,
    CountriesModule,
    AssessmentCyclesModule,
    AssessmentTypesModule,
    SimulationsModule,
    SimDocsModule,
    FoldersModule,
    SimulationMappersModule,
    RolesModule,
    KeyConceptsModule,
    SettingsModule,
    FindingGroupsModule,
    ConnectFindingGroupsModule,
    NotesModule,
    AnswersModule,
    MongooseModule.forFeature(
      [
        { name: Demo_User.name, schema: Demo_UserSchema },
        { name: Demo_UserSummary.name, schema: Demo_UserSummarySchema },
        {
          name: Demo_UserSummaryPfizer.name,
          schema: Demo_UserSummaryPfizerSchema,
        },
        {
          name: Demo_UserSummaryAbbvie.name,
          schema: Demo_UserSummaryAbbvieSchema,
        },
        {
          name: Demo_UserSummaryPharmOlam.name,
          schema: Demo_UserSummaryPharmOlamSchema,
        },
        {
          name: Demo_UserSummaryAllucent.name,
          schema: Demo_UserSummaryAllucentSchema,
        },
        {
          name: Demo_UserSummarySyneos.name,
          schema: Demo_UserSummarySyneosSchema,
        },
        { name: Demo_UserStatus.name, schema: Demo_UserStatusSchema },
        {
          name: Demo_UserStatusPfizer.name,
          schema: Demo_UserStatusPfizerSchema,
        },
        {
          name: Demo_UserStatusAbbvie.name,
          schema: Demo_UserStatusAbbvieSchema,
        },
        {
          name: Demo_UserStatusPharmOlam.name,
          schema: Demo_UserStatusPharmOlamSchema,
        },
        {
          name: Demo_UserStatusAllucent.name,
          schema: Demo_UserStatusAllucentSchema,
        },
        {
          name: Demo_UserStatusSyneos.name,
          schema: Demo_UserStatusSyneosSchema,
        },
        {
          name: Demo_UsersDemographic.name,
          schema: Demo_UsersDemographicSchema,
        },
        {
          name: Demo_UsersScoreSummary.name,
          schema: Demo_UsersScoreSummarySchema,
        },
        {
          name: Demo_Assessment.name,
          schema: Demo_AssessmentSchema,
        },
        {
          name: Demo_SimUsersSummary.name,
          schema: Demo_SimUsersSummarySchema,
        },
        {
          name: Demo_SimUsersSummaryPfizer.name,
          schema: Demo_SimUsersSummaryPfizerSchema,
        },
        {
          name: Demo_SimUsersSummaryAbbvie.name,
          schema: Demo_SimUsersSummaryAbbvieSchema,
        },
        {
          name: Demo_SimUsersSummaryPharmOlam.name,
          schema: Demo_SimUsersSummaryPharmOlamSchema,
        },
        {
          name: Demo_SimUsersSummaryAllucent.name,
          schema: Demo_SimUsersSummaryAllucentSchema,
        },
        {
          name: Demo_SimUsersSummarySyneos.name,
          schema: Demo_SimUsersSummarySyneosSchema,
        },
        { name: Demo_Finding.name, schema: Demo_FindingSchema },
        {
          name: Demo_FindingsSelected.name,
          schema: Demo_FindingsSelectedSchema,
        },
        {
          name: Demo_MonitoringNotes.name,
          schema: Demo_MonitoringNoteSchema,
        },
        {
          name: Demo_ScoringAdjudication.name,
          schema: Demo_ScoringAdjudicationSchema,
        },
        {
          name: Demo_ScoringBehaviors.name,
          schema: Demo_ScoringBehaviorSchema,
        },
        {
          name: Demo_SimulationSetting.name,
          schema: Demo_SimulationSettingSchema,
        },
        { name: Demo_TempTimerLog.name, schema: Demo_TempTimerLogSchema },
        { name: Demo_TrainingModule.name, schema: Demo_TrainingModuleSchema },
        {
          name: Demo_TrainingModulePage.name,
          schema: Demo_TrainingModulePageSchema,
        },
        {
          name: Demo_TrainingStatusSummary.name,
          schema: Demo_TrainingStatusSummarySchema,
        },
        {
          name: Demo_TrainingModuleScoreSummary.name,
          schema: Demo_TrainingModuleScoreSummarySchema,
        },
        {
          name: Demo_Client.name,
          schema: Demo_ClientSchema,
        },
        {
          name: Demo_ComplianceNotes.name,
          schema: Demo_ComplianceNoteSchema,
        },
        {
          name: Demo_DomainTips.name,
          schema: Demo_DomainTipsSchema,
        },
        {
          name: Demo_Document.name,
          schema: Demo_DocumentSchema,
        },
        {
          name: Demo_DocumentFolder.name,
          schema: Demo_DocumentFolderSchema,
        },
      ],
      'demo_db',
    ),
    MongooseModule.forFeature(
      [
        { name: Demo_User.name, schema: Demo_UserSchema },
        { name: Demo_UserSummary.name, schema: Demo_UserSummarySchema },
        {
          name: Demo_UserSummaryPfizer.name,
          schema: Demo_UserSummaryPfizerSchema,
        },
        {
          name: Demo_UserSummaryAbbvie.name,
          schema: Demo_UserSummaryAbbvieSchema,
        },
        {
          name: Demo_UserSummaryPharmOlam.name,
          schema: Demo_UserSummaryPharmOlamSchema,
        },
        {
          name: Demo_UserSummaryAllucent.name,
          schema: Demo_UserSummaryAllucentSchema,
        },
        {
          name: Demo_UserSummarySyneos.name,
          schema: Demo_UserSummarySyneosSchema,
        },
        { name: Demo_UserStatus.name, schema: Demo_UserStatusSchema },
        {
          name: Demo_UserStatusPfizer.name,
          schema: Demo_UserStatusPfizerSchema,
        },
        {
          name: Demo_UserStatusAbbvie.name,
          schema: Demo_UserStatusAbbvieSchema,
        },
        {
          name: Demo_UserStatusPharmOlam.name,
          schema: Demo_UserStatusPharmOlamSchema,
        },
        {
          name: Demo_UserStatusAllucent.name,
          schema: Demo_UserStatusAllucentSchema,
        },
        {
          name: Demo_UserStatusSyneos.name,
          schema: Demo_UserStatusSyneosSchema,
        },
        {
          name: Demo_UsersDemographic.name,
          schema: Demo_UsersDemographicSchema,
        },
        {
          name: Demo_UsersScoreSummary.name,
          schema: Demo_UsersScoreSummarySchema,
        },
        {
          name: Demo_Assessment.name,
          schema: Demo_AssessmentSchema,
        },
        {
          name: Demo_SimUsersSummary.name,
          schema: Demo_SimUsersSummarySchema,
        },
        {
          name: Demo_SimUsersSummaryPfizer.name,
          schema: Demo_SimUsersSummaryPfizerSchema,
        },
        {
          name: Demo_SimUsersSummaryAbbvie.name,
          schema: Demo_SimUsersSummaryAbbvieSchema,
        },
        {
          name: Demo_SimUsersSummaryPharmOlam.name,
          schema: Demo_SimUsersSummaryPharmOlamSchema,
        },
        {
          name: Demo_SimUsersSummaryAllucent.name,
          schema: Demo_SimUsersSummaryAllucentSchema,
        },
        {
          name: Demo_SimUsersSummarySyneos.name,
          schema: Demo_SimUsersSummarySyneosSchema,
        },
        { name: Demo_Finding.name, schema: Demo_FindingSchema },
        {
          name: Demo_FindingsSelected.name,
          schema: Demo_FindingsSelectedSchema,
        },
        {
          name: Demo_MonitoringNotes.name,
          schema: Demo_MonitoringNoteSchema,
        },
        {
          name: Demo_ScoringAdjudication.name,
          schema: Demo_ScoringAdjudicationSchema,
        },
        {
          name: Demo_ScoringBehaviors.name,
          schema: Demo_ScoringBehaviorSchema,
        },
        {
          name: Demo_SimulationSetting.name,
          schema: Demo_SimulationSettingSchema,
        },
        { name: Demo_TempTimerLog.name, schema: Demo_TempTimerLogSchema },
        { name: Demo_TrainingModule.name, schema: Demo_TrainingModuleSchema },
        {
          name: Demo_TrainingModulePage.name,
          schema: Demo_TrainingModulePageSchema,
        },
        {
          name: Demo_TrainingStatusSummary.name,
          schema: Demo_TrainingStatusSummarySchema,
        },
        {
          name: Demo_TrainingModuleScoreSummary.name,
          schema: Demo_TrainingModuleScoreSummarySchema,
        },
        {
          name: Demo_Client.name,
          schema: Demo_ClientSchema,
        },
        {
          name: Demo_ComplianceNotes.name,
          schema: Demo_ComplianceNoteSchema,
        },
        {
          name: Demo_DomainTips.name,
          schema: Demo_DomainTipsSchema,
        },
        {
          name: Demo_Document.name,
          schema: Demo_DocumentSchema,
        },
        {
          name: Demo_DocumentFolder.name,
          schema: Demo_DocumentFolderSchema,
        },
      ],
      'demo_db2',
    ),
  ],
  controllers: [MigrationsController],
  providers: [MigrationsService, MigrationRepository, Migration2Repository],
  exports: [MigrationsService, MigrationRepository, Migration2Repository],
})
export default class MigrationModule {}
