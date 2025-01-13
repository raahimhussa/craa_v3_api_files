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
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SimulationMapper } from './schemas/simulationMapper.schema';
import SimulationMapperDto from './dto/simulationMapper.dto';
import SimulationMappersService from './simulationMappers.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@ApiTags('SimulationMappers')
@Controller()
export class SimulationMappersController {
  constructor(
    private readonly simulationMappersService: SimulationMappersService,
  ) {}

  @ApiBody({})
  @Post()
  async create(
    @Body() simulationMapper: SimulationMapperDto,
  ): Promise<SimulationMapper | null> {
    return this.simulationMappersService.create(simulationMapper);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<SimulationMapper>) {
    return this.simulationMappersService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<SimulationMapper>) {
    return this.simulationMappersService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<SimulationMapper>,
  ) {
    return this.simulationMappersService.delete(query);
  }
}
