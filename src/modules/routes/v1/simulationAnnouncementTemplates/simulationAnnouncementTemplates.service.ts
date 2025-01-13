import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import {
  SimulationAnnouncementTemplate,
  SimulationAnnouncementTemplateDocument,
} from './schemas/simulationAnnouncementTemplate.schema';

import { Injectable } from '@nestjs/common';
import SimulationAnnouncementTemplateDto from './dto/SimulationAnnouncementTemplateDocument.dto';
import SimulationAnnouncementTemplatesRepository from './simulationAnnouncementTemplates.repository';

@Injectable()
export default class SimulationAnnouncementTemplatesService {
  constructor(
    private readonly simulationAnnouncementTemplatesRepository: SimulationAnnouncementTemplatesRepository,
  ) {}

  create(
    simulationAnnouncementTemplate: SimulationAnnouncementTemplateDto,
  ): Promise<SimulationAnnouncementTemplate | null> {
    return this.simulationAnnouncementTemplatesRepository.create(
      simulationAnnouncementTemplate,
    );
  }

  find(
    query: MongoQuery<SimulationAnnouncementTemplate>,
  ): Promise<SimulationAnnouncementTemplate[] | null> {
    return this.simulationAnnouncementTemplatesRepository.find(query);
  }

  count(query: MongoQuery<SimulationAnnouncementTemplate>) {
    return this.simulationAnnouncementTemplatesRepository.count(query);
  }

  update(body: MongoUpdate<SimulationAnnouncementTemplate>) {
    if (body.options?.multi) {
      return this.simulationAnnouncementTemplatesRepository.updateOne(body);
    }
    return this.simulationAnnouncementTemplatesRepository.updateMany(body);
  }

  delete(query: MongoDelete<SimulationAnnouncementTemplate>) {
    return this.simulationAnnouncementTemplatesRepository.deleteOne(query);
  }
}
