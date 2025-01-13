import { RouterModule, Routes } from 'nest-router';

import ConnectFindingGroupsModule from './connectFindingGroup/connectFindingGroups.module';
import DashboardModule from './DashboardData/dashboard.module';
import DataDumpModule from './dataDump/dataDump.module';
import ExcelModule from './Excel/excel.module';
import FindingGroupsModule from './findingGroup/findingGroups.module';
import InvoiceManagementModule from './InvoiceManagement/invoiceManagement.module';
import LogManagerModule from './LogManager/logManager.module';
import MigrationModule from './migration/migration.module';
import { Module } from '@nestjs/common';
import PdfFileManagementModule from './pdfFileManagement/pdfFileManagement.module';
import ScoringManagementModule from './ScoringManagement/scoringManagement.module';
import SimDistributionModule from './SimDistribution/simDistribution.module';
import SimManagementModule from './SimManagement/simManagement.module';
import SimulationMappersModule from './simulationMapper/simulationMappers.module';
import UserStatusManagementModule from './UserStatusManagement/userStatusManagement.module';

const routes: Routes = [
  {
    path: '/v3',
    children: [
      {
        path: 'dataDump',
        module: DataDumpModule,
      },
      {
        path: 'dashboard',
        module: DashboardModule,
      },
      {
        path: 'simManagement',
        module: SimManagementModule,
      },
      {
        path: 'scoringManagement',
        module: ScoringManagementModule,
      },
      {
        path: 'excel',
        module: ExcelModule,
      },
      {
        path: 'findingGroups',
        module: FindingGroupsModule,
      },
      {
        path: 'connectFindingGroups',
        module: ConnectFindingGroupsModule,
      },
      {
        path: 'invoiceManagement',
        module: InvoiceManagementModule,
      },
      {
        path: 'logManager',
        module: LogManagerModule,
      },
      {
        path: 'pdfFileManagement',
        module: PdfFileManagementModule,
      },
      {
        path: 'userStatusManagement',
        module: UserStatusManagementModule,
      },
      {
        path: 'simDistribution',
        module: SimDistributionModule,
      },
      {
        path: 'simulationMappers',
        module: SimulationMappersModule,
      },
      {
        path: 'migrations',
        module: MigrationModule,
      },
    ],
  },
];

@Module({
  imports: [
    RouterModule.forRoutes(routes),
    DataDumpModule,
    SimManagementModule,
    ScoringManagementModule,
    ExcelModule,
    InvoiceManagementModule,
    LogManagerModule,
    PdfFileManagementModule,
    UserStatusManagementModule,
    SimDistributionModule,
    SimulationMappersModule,
    DashboardModule,
    MigrationModule,
  ],
})
export default class V3Module {}
