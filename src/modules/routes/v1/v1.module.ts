import { RouterModule, Routes } from 'nest-router';

import AgreementsModule from './agreements/agreements.module';
import AssessmentCyclesModule from './assessmentCycles/assessmentCycles.module';
import AssessmentTypesModule from './assessmentTypes/assessmentTypes.module';
import AuthModule from './auth/auth.module';
import CategoriesModule from './categories/categories.module';
import ClientUnitsModule from './clientUnits/clientUnits.module';
import CountriesModule from './countries/countries.module';
import DocsModule from './docs/docs.module';
import DocumentVariableGroupsModule from './documentVariableGroups/documentVariableGroups.module';
import DocumentVariablesModule from './documentVariables/documentVariables.module';
import DocumentsModule from './documents/documents.module';
import FilesModule from './files/files.module';
import { Module } from '@nestjs/common';
import PagesModule from './pages/pages.module';
import RolesModule from './roles/roles.module';
import SimDocsModule from './simDocs/simDocs.module';
// import SimulationAnnouncementTemplatesModule from './simulationAnnouncementTemplates/simulationAnnouncementTemplates.module';
import SimulationsModule from './simulations/simulations.module';
import SubjectsModule from './subjects/subjects.module';
import SystemSettingsModule from './systemSettings/systemSettings.module';
import TemplatesModule from './templates/templates.module';
import TrainingResourcesModule from './trainingResources/trainingResources.module';
import UserAssessmentCyclesModule from './userAssessmentCycles/userAssessmentCycles.module';
import UsersModule from './users/users.module';

const routes: Routes = [
  {
    path: '/v1',
    children: [
      { path: 'auth', module: AuthModule },
      { path: 'users', module: UsersModule },
      { path: 'files', module: FilesModule },
      { path: 'trainingResources', module: TrainingResourcesModule },
      { path: 'simulations', module: SimulationsModule },
      { path: 'assessmentCycles', module: AssessmentCyclesModule },
      { path: 'clientUnits', module: ClientUnitsModule },
      { path: 'roles', module: RolesModule },
      { path: 'countries', module: CountriesModule },
      { path: 'docs', module: DocsModule },
      { path: 'userAssessmentCycles', module: UserAssessmentCyclesModule },
      { path: 'subjects', module: SubjectsModule },
      { path: 'categories', module: CategoriesModule },
      { path: 'simDocs', module: SimDocsModule },
      { path: 'agreements', module: AgreementsModule },
      { path: 'templates', module: TemplatesModule },
      { path: 'assessmentTypes', module: AssessmentTypesModule },
      { path: 'systemSettings', module: SystemSettingsModule },
      { path: 'documentVariables', module: DocumentVariablesModule },
      { path: 'documentVariableGroups', module: DocumentVariableGroupsModule },
      { path: 'documents', module: DocumentsModule },
      { path: 'documentPages', module: PagesModule },
      // {
      //   path: '/simulationAnnouncementTemplates',
      //   module: SimulationAnnouncementTemplatesModule,
      // },
    ],
  },
];

@Module({
  imports: [
    RouterModule.forRoutes(routes),
    CategoriesModule,
    SubjectsModule,
    ClientUnitsModule,
    RolesModule,
    AuthModule,
    UsersModule,
    FilesModule,
    SimulationsModule,
    AssessmentCyclesModule,
    UserAssessmentCyclesModule,
    CountriesModule,
    DocsModule,
    SimDocsModule,
    AgreementsModule,
    TemplatesModule,
    AssessmentTypesModule,
    TrainingResourcesModule,
    SystemSettingsModule,
    DocumentsModule,
    PagesModule,
    DocumentVariablesModule,
    DocumentVariableGroupsModule,
    // SimulationAnnouncementTemplatesModule,
  ],
})
export default class V1Module {}
