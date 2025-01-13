import { ClientUnit, ClientUnitSchema } from './schemas/clientUnit.schema';

import AssessmentCyclesModule from '../assessmentCycles/assessmentCycles.module';
import AssessmentTypesModule from '../assessmentTypes/assessmentTypes.module';
import { ClientUnitsController } from './clientUnits.controller';
import ClientUnitsRepository from './clientUnits.repository';
import { ClientUnitsService } from './clientUnits.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AssessmentCyclesModule,
    AssessmentTypesModule,
    MongooseModule.forFeature([
      { name: ClientUnit.name, schema: ClientUnitSchema },
    ]),
  ],
  controllers: [ClientUnitsController],
  providers: [ClientUnitsService, ClientUnitsRepository],
  exports: [ClientUnitsService, ClientUnitsRepository],
})
export default class ClientUnitsModule {}
