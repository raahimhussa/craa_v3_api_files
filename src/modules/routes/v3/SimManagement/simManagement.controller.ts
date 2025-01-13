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

import SimManagementService from './simManagement.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';
import { Response } from 'express';

@ApiTags('SimManagement')
@Controller()
export class SimManagementController {
  constructor(private readonly userDataService: SimManagementService) {}

  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.userDataService.find(query);
  }

  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.userDataService.count(query);
  }

  @Get('excel')
  async excel(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    const data = await this.userDataService.getExcel(query);
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
    return this.userDataService.reopen(
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
    return this.userDataService.reallocate(
      userSimulationId,
      additionalTestTime,
      additionalAttemptCount,
    );
  }

  // @Patch('userSimulations/:userSimulationId/publish')
  // async publish(
  //   @Param('userSimulationId') userSimulationId: string,
  // ): Promise<any> {
  //   return this.userDataService.publish(userSimulationId);
  // }

  // @ApiQuery({})
  // @Post('userSimulations/:userSimulationId/retract')
  // async retract(@Param('userSimulationId') userSimulationId: string) {
  //   return this.userDataService.retract(userSimulationId);
  // }

  // @Patch('userSimulations/:userSimulationId/baselineDistribute')
  // async distribute(
  //   @Param('userSimulationId') userSimulationId: string,
  // ): Promise<any> {
  //   return this.userDataService.baselineDistribute(userSimulationId);
  // }

  // @Patch('userSimulations/:userSimulationId/baselinePreview')
  // async preview(
  //   @Param('userSimulationId') userSimulationId: string,
  // ): Promise<any> {
  //   return this.userDataService.baselinePreview(userSimulationId);
  // }
}
