import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentCyclesService } from './assessmentCycles.service';
import { AssessmentCyclesController } from './assessmentCycles.controller';
import AssessmentCyclesRepository from './assessmentCycles.repository';
import {
  AssessmentCycle,
  AssessmentCycleSchema,
} from './assessmentCycle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssessmentCycle.name, schema: AssessmentCycleSchema },
    ]),
  ],
  controllers: [AssessmentCyclesController],
  providers: [AssessmentCyclesService, AssessmentCyclesRepository],
  exports: [AssessmentCyclesService, AssessmentCyclesRepository],
})
export default class AssessmentCyclesModule {}
