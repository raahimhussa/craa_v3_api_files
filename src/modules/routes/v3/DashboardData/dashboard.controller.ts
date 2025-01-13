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

import DashboardService from './dashboard.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';
import { Response } from 'express';

@ApiTags('Dashboard')
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.dashboardService.find(query);
  }

  // @Get('totalAccounts')
  // async totalAccounts(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
  //   return this.dashboardService.totalAccounts(query);
  // }

  @Get('excel')
  async excel(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    const data = await this.dashboardService.getExcel(query);
    return data;
  }

  @ApiQuery({})
  @Post('userSimulations/:userSimulationId/reopen')
  async reopen(
    @Param('userSimulationId') userSimulationId: string,
    @Body()
    {
      additionalTestTime,
      additionalAttemptCount,
    }: { additionalTestTime: number; additionalAttemptCount: number },
  ) {
    return this.dashboardService.reopen(
      userSimulationId,
      additionalTestTime,
      additionalAttemptCount,
    );
  }

  @ApiQuery({})
  @Post('userSimulations/:userSimulationId/reallocate')
  async reallocate(
    @Param('userSimulationId') userSimulationId: string,
    @Body()
    {
      additionalTestTime,
      additionalAttemptCount,
    }: { additionalTestTime: number; additionalAttemptCount: number },
  ) {
    return this.dashboardService.reallocate(
      userSimulationId,
      additionalTestTime,
      additionalAttemptCount,
    );
  }

  // @Patch('userSimulations/:userSimulationId/publish')
  // async publish(
  //   @Param('userSimulationId') userSimulationId: string,
  // ): Promise<any> {
  //   return this.dashboardService.publish(userSimulationId);
  // }

  // @ApiQuery({})
  // @Post('userSimulations/:userSimulationId/retract')
  // async retract(@Param('userSimulationId') userSimulationId: string) {
  //   return this.dashboardService.retract(userSimulationId);
  // }

  // @Patch('userSimulations/:userSimulationId/baselineDistribute')
  // async distribute(
  //   @Param('userSimulationId') userSimulationId: string,
  // ): Promise<any> {
  //   return this.dashboardService.baselineDistribute(userSimulationId);
  // }

  // @Patch('userSimulations/:userSimulationId/baselinePreview')
  // async preview(
  //   @Param('userSimulationId') userSimulationId: string,
  // ): Promise<any> {
  //   return this.dashboardService.baselinePreview(userSimulationId);
  // }
}
