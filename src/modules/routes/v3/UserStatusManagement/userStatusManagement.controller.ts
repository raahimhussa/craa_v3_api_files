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

import UserStatusManagementService from './userStatusManagement.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';
import { Response } from 'express';

@ApiTags('UserStatusManagement')
@Controller()
export class UserStatusManagementController {
  constructor(private readonly userDataService: UserStatusManagementService) {}

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
}
