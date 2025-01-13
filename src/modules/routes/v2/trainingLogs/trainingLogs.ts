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
import { TrainingLog } from './schemas/trainingLogs.schema';
import LogDto from './dto/log.dto';
import TrainingLogsService from './trainingLogs.service';

@ApiTags('TrainingLogs')
@Controller()
export class TrainingLogsController {
  constructor(private readonly logsService: TrainingLogsService) {}

  @ApiBody({ type: LogDto })
  @Post()
  async create(@Body() log: LogDto): Promise<TrainingLog | null> {
    return this.logsService.create(log);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<TrainingLog>) {
    return this.logsService.find(query);
  }

  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<TrainingLog>) {
    return this.logsService.count(query);
  }

  @ApiQuery({})
  @Get(':logId')
  async findOne(
    @Param('logId') logId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<TrainingLog>,
  ) {
    if (logId === 'custom') return this.logsService.findOne(query);

    return this.logsService.findById(logId);
  }

  @ApiBody({})
  @Patch()
  async update(
    @Body() body: MongoUpdate<TrainingLog>,
  ): Promise<TrainingLog | null> {
    return this.logsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<TrainingLog>,
  ): Promise<TrainingLog[] | null> {
    return this.logsService.delete(query);
  }
}
