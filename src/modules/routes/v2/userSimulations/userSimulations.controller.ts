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
import { UserSimulation } from './schemas/userSimulation.schema';
import UserSimulationDto from './dto/userSimulation.dto';
import UserSimulationsService from './userSimulations.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@ApiTags('UserSimulations')
@Controller()
export class UserSimulationsController {
  constructor(
    private readonly userSimulationsService: UserSimulationsService,
  ) {}

  @ApiBody({})
  @Post()
  async create(
    @Body() userSimulation: UserSimulationDto,
  ): Promise<UserSimulation | null> {
    return this.userSimulationsService.create(userSimulation);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<UserSimulation>) {
    return this.userSimulationsService.find(query);
  }
  @ApiQuery({})
  @Get('withoutAggregation')
  async findWithoutAggregation(
    @Query(new parseQueryPipe()) query: MongoQuery<UserSimulation>,
  ) {
    return this.userSimulationsService.findWithoutAggregation(query);
  }

  @ApiQuery({})
  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<UserSimulation>) {
    return this.userSimulationsService.count(query);
  }

  @ApiQuery({})
  @Get(':userSimulationId')
  async findOne(
    @Param('userSimulationId') userSimulationId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<UserSimulation>,
  ) {
    if (userSimulationId === 'custom')
      return this.userSimulationsService.findOne(query);

    return this.userSimulationsService.findById(userSimulationId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<UserSimulation>) {
    return this.userSimulationsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<UserSimulation>,
  ) {
    return this.userSimulationsService.delete(query);
  }
}
