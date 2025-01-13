import {
  Controller,
  Get,
  Header,
  Res,
  Body,
  Query,
  Post,
  Param,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import ExcelService from './excel.service';
import { Response } from 'express';

@ApiTags('Excel')
@Controller()
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @ApiQuery({})
  @Post('/usercard')
  // @Header('Content-Type', 'text/xlsx')
  async getUserCardData(@Res() res: Response, @Body() data: any) {
    let result = await this.excelService.getUserCardData(data);
    res.download(`${result}`);
  }
  @ApiQuery({})
  @Post('/roadmap')
  // @Header('Content-Type', 'text/xlsx')
  async getRoadmapData(@Res() res: Response, @Body() data: any) {
    let result = await this.excelService.getRoadmapData(data);
    res.download(`${result}`);
  }
  @ApiQuery({})
  @Get('/userLogs/:userId')
  // @Header('Content-Type', 'text/xlsx')
  async getUserLogData(@Res() res: Response, @Param('userId') userId: any) {
    let result = await this.excelService.getUserLogData(userId);
    res.download(`${result}`);
  }
  @ApiQuery({})
  @Get('/trainingLogs/:userId')
  // @Header('Content-Type', 'text/xlsx')
  async getTrainingLogData(@Res() res: Response, @Param('userId') userId: any) {
    let result = await this.excelService.getTrainingLogData(userId);
    res.download(`${result}`);
  }
  @ApiQuery({})
  @Get('/notes/:userId')
  // @Header('Content-Type', 'text/xlsx')
  async getNoteData(@Res() res: Response, @Param('userId') userId: any) {
    let result = await this.excelService.getNoteData(userId);
    res.download(`${result}`);
  }
}
