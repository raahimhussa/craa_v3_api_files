import * as AutoIncrementFactory from 'mongoose-sequence';

import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Simulation, SimulationSchema } from './schemas/simulation.schema';

import { Connection } from 'mongoose';
import FoldersModule from '../../v2/folders/folders.module';
import { Module } from '@nestjs/common';
import { SimulationsController } from './simulations.controller';
import SimulationsRepository from './simulations.repository';
import { SimulationsService } from './simulations.service';
import { SortNPaginationService } from 'src/common/aggregations';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Simulation.name,
        useFactory: async (connection: Connection) => {
          const schema = SimulationSchema;
          const autoIncrement = AutoIncrementFactory(connection);
          schema.plugin(autoIncrement, {
            id: 'simulations_visibleId',
            inc_field: 'visibleId',
          });
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    FoldersModule,
    SortNPaginationService,
  ],
  controllers: [SimulationsController],
  providers: [
    SimulationsService,
    SimulationsRepository,
    SortNPaginationService,
  ],
  exports: [SimulationsService, SimulationsRepository],
})
export default class SimulationsModule {}
