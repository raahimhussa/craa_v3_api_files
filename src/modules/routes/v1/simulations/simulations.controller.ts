import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  PatchBody,
  FindQuery,
  DeleteQuery,
} from 'src/common/interfaces/mongoose.entity';
import CreateSimulationDto from './dto/createSimulation.dto';
import { SimulationsService } from './simulations.service';
import { Simulation } from './schemas/simulation.schema';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { Response } from 'express';

@ApiTags('Simulations')
@Controller()
export class SimulationsController {
  constructor(private readonly simulationService: SimulationsService) {}

  @Post()
  async create(@Body() createSimulationDto: CreateSimulationDto) {
    return this.simulationService.create(createSimulationDto);
  }

  @Get()
  async find(@Query(new parseQueryPipe()) query: FindQuery<Simulation>) {
    if (query.options?.multi) {
      return this.simulationService.find(query);
    }
    return this.simulationService.findOne(query);
  }

  @Get('count')
  async count(@Query(new parseQueryPipe()) query: FindQuery<Simulation>) {
    return this.simulationService.count(query);
  }

  @Get('excel')
  async excel(@Res() res: Response) {
    const result = (await this.simulationService.excelExport()) as string;
    return res.download(result);
  }

  @Patch()
  async update(@Body() body: PatchBody<Simulation>) {
    return this.simulationService.update(body);
  }

  @Delete()
  async delete(@Query(new parseQueryPipe()) query: DeleteQuery<Simulation>) {
    return this.simulationService.delete(query);
  }
}
