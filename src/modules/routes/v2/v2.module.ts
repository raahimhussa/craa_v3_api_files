import { RouterModule, Routes } from 'nest-router';

import AdminLogsModule from './adminLogs/adminLogs.module';
import AnswersModule from './answers/answers.module';
import AssessmentsModule from './assessments/assessments.module';
import AuthLogsModule from './authLogs/authLogs.module';
import BookmarksModule from './bookmarks/bookmarks.module';
import DomainsModule from './domains/domains.module';
import FindingsModule from './findings/findings.module';
import FoldersModule from './folders/folders.module';
import GroupsModule from './groups/groups.module';
import KeyConceptsModule from './keyConcepts/keyConcepts.module';
import LogsModule from './logs/logs.module';
import { Module } from '@nestjs/common';
import NotesModule from './notes/notes.module';
import PdfFoldersModule from './pdfFolders/pdfFolders.module';
import PoliciesModule from './policies/policies.module';
import QuizzesModule from './quizzes/quizzes.module';
import ScreenRecordersModule from './screenRecorders/screenRecorders.module';
import SettingsModule from './settings/settings.module';
import TrainingLogsModule from './trainingLogs/trainingLogs.module';
import TrainingsModule from './trainings/training.module';
import TutorialsModule from './tutorials/tutorials.module';
import UserSimulationsModule from './userSimulations/userSimulations.module';
import UserTrainingsModule from './userTrainings/userTrainings.module';
import VendorsModule from './vendors/vendors.module';
import VideosModule from './videos/video.module';
import ViewportsModule from './viewports/viewports.module';

const routes: Routes = [
  {
    path: '/v2',
    children: [
      {
        path: 'adminLogs',
        module: AdminLogsModule,
      },
      {
        path: 'viewports',
        module: ViewportsModule,
      },
      {
        path: 'notes',
        module: NotesModule,
      },
      {
        path: 'screenRecorders',
        module: ScreenRecordersModule,
      },
      {
        path: 'logs',
        module: LogsModule,
      },
      {
        path: 'authLogs',
        module: AuthLogsModule,
      },
      {
        path: 'trainingLogs',
        module: TrainingLogsModule,
      },
      {
        path: 'trainings',
        module: TrainingsModule,
      },
      {
        path: 'bookmarks',
        module: BookmarksModule,
      },
      {
        path: 'findings',
        module: FindingsModule,
      },
      {
        path: 'folders',
        module: FoldersModule,
      },
      {
        path: 'domains',
        module: DomainsModule,
      },
      {
        path: 'keyConcepts',
        module: KeyConceptsModule,
      },
      {
        path: 'policies',
        module: PoliciesModule,
      },
      {
        path: 'pdfFolders',
        module: PdfFoldersModule,
      },
      {
        path: 'quizzes',
        module: QuizzesModule,
      },
      {
        path: 'groups',
        module: GroupsModule,
      },
      {
        path: 'assessments',
        module: AssessmentsModule,
      },
      {
        path: 'settings',
        module: SettingsModule,
      },
      {
        path: 'answers',
        module: AnswersModule,
      },
      {
        path: 'userSimulations',
        module: UserSimulationsModule,
      },
      {
        path: 'videos',
        module: VideosModule,
      },
      {
        path: 'userTrainings',
        module: UserTrainingsModule,
      },
      {
        path: 'videos',
        module: VideosModule,
      },
      {
        path: 'vendors',
        module: VendorsModule,
      },
      {
        path: 'tutorials',
        module: TutorialsModule,
      },
    ],
  },
];

@Module({
  imports: [
    RouterModule.forRoutes(routes),
    AdminLogsModule,
    LogsModule,
    AuthLogsModule,
    TrainingLogsModule,
    TrainingsModule,
    ViewportsModule,
    NotesModule,
    ScreenRecordersModule,
    BookmarksModule,
    FindingsModule,
    FoldersModule,
    KeyConceptsModule,
    DomainsModule,
    PoliciesModule,
    PdfFoldersModule,
    QuizzesModule,
    GroupsModule,
    AssessmentsModule,
    SettingsModule,
    AnswersModule,
    UserSimulationsModule,
    VideosModule,
    UserTrainingsModule,
    VendorsModule,
    TutorialsModule,
  ],
})
export default class V2Module {}
