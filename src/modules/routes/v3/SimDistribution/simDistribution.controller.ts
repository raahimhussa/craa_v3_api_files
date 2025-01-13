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

import SimDistributionService from './simDistribution.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';
import { Response } from 'express';

@ApiTags('SimDistribution')
@Controller()
export class SimDistributionController {
  constructor(
    private readonly simDistributionService: SimDistributionService,
  ) {}

  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.simDistributionService.find(query);
  }

  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.simDistributionService.count(query);
  }

  @Patch('userSimulations/:userSimulationId/baselineDistribute')
  async baselineDistribute(
    @Param('userSimulationId') userSimulationId: string,
  ): Promise<any> {
    return this.simDistributionService.baselineDistribute(userSimulationId);
  }

  @Patch('userSimulations/:userSimulationId/followupDistribute')
  async followupDistribute(
    @Param('userSimulationId') userSimulationId: string,
  ): Promise<any> {
    return this.simDistributionService.followupDistribute(userSimulationId);
  }

  @Patch('userAssessmentCycles/:userAssessmentCycleId/distributeAll')
  async distributeAll(
    @Param('userAssessmentCycleId') userAssessmentCycleId: string,
  ): Promise<any> {
    return this.simDistributionService.distributeAll(userAssessmentCycleId);
  }

  // @Get('excel')
  // async excel(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
  //   const data = await this.userDataService.getExcel(query);
  //   return data;
  // }

  // @ApiQuery({})
  // @Post('userSimulations/:userSimulationId/reopen')
  // async reopen(
  //   @Param('userSimulationId') userSimulationId: string,
  //   @Body()
  //   {
  //     additionalTestTime,
  //     additionalAttemptCount,
  //   }: { additionalTestTime: number; additionalAttemptCount: number },
  // ) {
  //   return this.userDataService.reopen(
  //     userSimulationId,
  //     additionalTestTime,
  //     additionalAttemptCount,
  //   );
  // }

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
