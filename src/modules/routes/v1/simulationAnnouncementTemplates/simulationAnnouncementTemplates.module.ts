import {
  SimulationAnnouncementTemplate,
  SimulationAnnouncementTemplateSchema,
} from './schemas/simulationAnnouncementTemplate.schema';

import AgreementsController from './simulationAnnouncementTemplates.controller';
import AgreementsRepository from './simulationAnnouncementTemplates.repository';
import AgreementsService from './simulationAnnouncementTemplates.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SimulationAnnouncementTemplate.name,
        schema: SimulationAnnouncementTemplateSchema,
      },
    ]),
  ],
  controllers: [AgreementsController],
  providers: [AgreementsService, AgreementsRepository],
  exports: [AgreementsService, AgreementsRepository],
})
export default class SimulationAnnouncementTemplatesModule {}
