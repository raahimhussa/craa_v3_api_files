import * as AutoIncrementFactory from 'mongoose-sequence';

import { Finding, FindingSchema } from './schemas/finding.schema';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';

import { Connection } from 'mongoose';
import DomainsModule from '../domains/domains.module';
import { FindingsController } from './findings.controller';
import FindingsRepository from './findings.repository';
import FindingsService from './findings.service';
import FoldersModule from '../folders/folders.module';
import { Module } from '@nestjs/common';
import SimDocsModule from '../../v1/simDocs/simDocs.module';
import SimulationMappersModule from '../../v3/simulationMapper/simulationMappers.module';
import SimulationsModule from '../../v1/simulations/simulations.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Finding.name,
        useFactory: async (connection: Connection) => {
          const schema = FindingSchema;
          const autoIncrement = AutoIncrementFactory(connection);
          schema.plugin(autoIncrement, {
            id: 'findings_visibleId',
            inc_field: 'visibleId',
            disable_hooks: true,
          });
          // console.log({ schema });
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    SimDocsModule,
    FoldersModule,
    DomainsModule,
    SimulationsModule,
    SimulationMappersModule,
  ],
  controllers: [FindingsController],
  providers: [FindingsService, FindingsRepository],
  exports: [FindingsService, FindingsRepository],
})
export default class FindingsModule {}
