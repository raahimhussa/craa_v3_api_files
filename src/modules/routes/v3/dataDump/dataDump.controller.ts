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
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import DataDumpService from './dataDump.service';
import { Response } from 'express';

@ApiTags('DataDump')
@Controller()
export class DataDumpsController {
  constructor(private readonly dataDumpService: DataDumpService) {}

  @ApiQuery({})
  @Get('users/:userId/userCard')
  async getUserCardData(@Param('userId') userId: string) {
    return this.dataDumpService.getUserCardData(userId);
  }

  @ApiQuery({})
  @Get('simulationAvg/:simulationId/:clientUnitId')
  async getSimulationAvg(
    @Param('simulationId') simulationId: string,
    @Param('clientUnitId') clientUnitId: string,
  ) {
    return this.dataDumpService.getSimulationAvg(simulationId, clientUnitId);
  }
  @ApiQuery({})
  @Get('domainAvg/:type/:clientUnitId')
  async getDomainAvg(
    @Param('type') type: string,
    @Param('clientUnitId') clientUnitId: string,
  ) {
    return this.dataDumpService.getDomainAvg(type, clientUnitId);
  }

  @ApiQuery({})
  @Get('/baselineDataDump')
  async getUserBaselineDataDump(
    @Query()
    {
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
    }: {
      assessmentCycleId: string;
      assessmentTypeId: string;
      clientUnitId: string;
      businessUnitId: string;
      businessCycleId: string;
    },
  ) {
    return this.dataDumpService.getBaselineDataDump(
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
    );
  }

  @ApiQuery({})
  @Get('/followupDataDump')
  async getUserFollowupDataDump(
    @Query()
    {
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
      domainId,
    }: {
      assessmentCycleId: string;
      assessmentTypeId: string;
      clientUnitId: string;
      businessUnitId: string;
      businessCycleId: string;
      domainId: string;
    },
  ) {
    return this.dataDumpService.getFollowupDataDump(
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
      domainId,
    );
  }

  @ApiQuery({})
  @Get('/baselineDataDump/excel')
  async baselineDataDumpExcel(
    @Query()
    {
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
      domainId,
    }: {
      assessmentCycleId: string;
      assessmentTypeId: string;
      clientUnitId: string;
      businessUnitId: string;
      businessCycleId: string;
      domainId: string;
    },
    @Res() res: Response,
  ) {
    const result = (await this.dataDumpService.getBaselineDataDumpExcel(
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
    )) as string;
    return res.download(result);
  }

  @ApiQuery({})
  @Get('/followupDataDump/excel')
  async followupDataDumpExcel(
    @Query()
    {
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
      domainId,
    }: {
      assessmentCycleId: string;
      assessmentTypeId: string;
      clientUnitId: string;
      businessUnitId: string;
      businessCycleId: string;
      domainId: string;
    },
    @Res() res: Response,
  ) {
    return this.dataDumpService.getFollowupDataDumpExcel(
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
      domainId,
    );
  }

  @ApiQuery({})
  @Post('/butr')
  async butrExcel(@Body() checkedItems: string[]) {
    return this.dataDumpService.getButrExcel(checkedItems);
  }

  // @ApiQuery({})
  // @Get('/userSimulationDataDump')
  // async getUserSimulationDataDump(@Body() body, @Param() param, @Query() query) {
  //   console.log({
  //     body,
  //     param,
  //     query,
  //   });
  // }

  // @ApiQuery({})
  // @Get('/userSimulationDataDump')
  // async getUserSimulationDataDump(
  //   @Body()
  //   {
  //     assessmentCycleId,
  //     assessmentTypeId,
  //     businessUnitId,
  //     domainId,
  //   }: {
  //     assessmentCycleId: string;
  //     assessmentTypeId: string;
  //     businessUnitId: string;
  //     domainId: string;
  //   },
  // ) {
  //   console.log({
  //     assessmentCycleId,
  //     assessmentTypeId,
  //     businessUnitId,
  //     domainId,
  //   });
  //   return this.dataDumpsService.getUserSimulationDataDump(
  //     assessmentCycleId,
  //     assessmentTypeId,
  //     businessUnitId,
  //     domainId,
  //   );
  // }
}
