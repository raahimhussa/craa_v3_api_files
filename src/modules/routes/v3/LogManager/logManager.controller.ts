import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';

import LogManagerService from './logManager.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';

@ApiTags('LogManager')
@Controller()
export class LogManagerController {
  constructor(private readonly logManagerService: LogManagerService) {}

  @Get('security/signin-review')
  async findTop10AuthLogs(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.logManagerService.findTop10AuthLogs();
  }

  @Get('simulationLogs')
  async findSimulationLogs(
    @Query(new parseQueryPipe()) query: MongoQuery<any>,
  ) {
    return this.logManagerService.findSimulationLogs(query);
  }

  @Get('simulationLogs/count')
  async findSimulationLogsCount(
    @Query(new parseQueryPipe()) query: MongoQuery<any>,
  ) {
    return this.logManagerService.findSimulationLogsCount(query);
  }
}
