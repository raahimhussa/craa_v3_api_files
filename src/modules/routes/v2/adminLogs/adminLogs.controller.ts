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
import {
  MongoQuery,
  MongoUpdate,
  MongoDelete,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { AdminLog } from './schemas/adminLog.schema';
import AdminLogDao from './dao/adminLogdao';
import AdminLogsService from './adminLogs.service';

@ApiTags('AdminLogs')
@Controller()
export class AdminLogsController {
  constructor(private readonly logsService: AdminLogsService) {}

  @ApiBody({})
  @Post()
  async create(@Body() log: AdminLogDao): Promise<AdminLog | null> {
    return this.logsService.create(log);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<AdminLog>) {
    return this.logsService.find(query);
  }

  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<AdminLog>) {
    return this.logsService.count(query);
  }

  @ApiQuery({})
  @Get(':logId')
  async findOne(
    @Param('logId') logId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<AdminLog>,
  ) {
    if (logId === 'custom') return this.logsService.findOne(query);

    return this.logsService.findById(logId);
  }

  @ApiBody({})
  @Patch()
  // async update(@Body() body: MongoUpdate<AdminLog>): Promise<AdminLog | null> {
  async update(@Body() body: MongoUpdate<AdminLog>) {
    return this.logsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<AdminLog>,
  ): Promise<AdminLog[] | null> {
    return this.logsService.delete(query);
  }
}
