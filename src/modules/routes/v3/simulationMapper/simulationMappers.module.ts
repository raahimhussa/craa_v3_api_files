import {
  SimulationMapper,
  SimulationMapperSchema,
} from './schemas/simulationMapper.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SimulationMappersController } from './simulationMappers.controller';
import SimulationMappersRepository from './simulationMappers.repository';
import SimulationMappersService from './simulationMappers.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: SimulationMapper.name,
        useFactory: () => {
          const schema = SimulationMapperSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [SimulationMappersController],
  providers: [SimulationMappersService, SimulationMappersRepository],
  exports: [SimulationMappersService, SimulationMappersRepository],
})
export default class SimulationMappersModule {}
