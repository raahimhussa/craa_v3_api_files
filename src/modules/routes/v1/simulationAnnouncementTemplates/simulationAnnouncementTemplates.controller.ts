import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  SimulationAnnouncementTemplate,
  SimulationAnnouncementTemplateDocument,
} from './schemas/simulationAnnouncementTemplate.schema';
import AgreementDto from './dto/SimulationAnnouncementTemplateDocument.dto';
import SimulationAnnouncementTemplatesService from './simulationAnnouncementTemplates.service';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';

@ApiTags('SimulationAnnouncementTemplates')
@Controller()
export default class SimulationAnnouncementTemplatesController {
  constructor(
    private readonly simulationAnnouncementTemplatesService: SimulationAnnouncementTemplatesService,
  ) {}

  @Post()
  async create(
    @Body() simulationAnnouncementTemplate: AgreementDto,
  ): Promise<SimulationAnnouncementTemplate | null> {
    return this.simulationAnnouncementTemplatesService.create(
      simulationAnnouncementTemplate,
    );
  }

  @Get('count')
  async count(
    @Query(new parseQueryPipe())
    query: MongoQuery<SimulationAnnouncementTemplateDocument>,
  ) {
    return this.simulationAnnouncementTemplatesService.count(query);
  }

  @ApiQuery({})
  @Get()
  async find(
    @Query(new parseQueryPipe())
    query: MongoQuery<SimulationAnnouncementTemplateDocument>,
  ) {
    return this.simulationAnnouncementTemplatesService.find(query);
  }

  @ApiQuery({})
  @Get('page/:pageNumber')
  async findWithPage(
    @Param('pageNumber')
    pageNumber: number,
  ) {
    const query = {
      filter: {
        isDeleted: false,
      },
      options: {
        skip: pageNumber > 0 ? (pageNumber - 1) * 10 : 0,
        limit: 10,
      },
    };
    const items = await this.simulationAnnouncementTemplatesService.find(query);
    const count = await this.simulationAnnouncementTemplatesService.count(
      query,
    );

    return { items, count };
  }

  // @ApiBody({})
  @Patch()
  async update(
    @Body() body: MongoUpdate<SimulationAnnouncementTemplateDocument>,
  ) {
    return this.simulationAnnouncementTemplatesService.update(body);
  }

  @Delete(':_id')
  async delete(
    @Param('_id')
    _id: MongoDelete<SimulationAnnouncementTemplateDocument>,
  ) {
    const query = {
      filter: {
        _id,
      },
    };
    return this.simulationAnnouncementTemplatesService.delete(query);
  }
}
