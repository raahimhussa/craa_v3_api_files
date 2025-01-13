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
import AuthLogDto from './dto/authLog.dto';
import AuthLogsService from './authLogs.service';
import { AuthLog } from './schemas/authLog.schema';

@ApiTags('AuthLogs')
@Controller()
export class AuthLogsController {
  constructor(private readonly authAuthLogsService: AuthLogsService) {}

  @ApiBody({ type: AuthLogDto })
  @Post()
  async create(@Body() authAuthLog: AuthLogDto): Promise<AuthLog | null> {
    return this.authAuthLogsService.create(authAuthLog);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<AuthLog>) {
    return this.authAuthLogsService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<AuthLog>): Promise<AuthLog | null> {
    return this.authAuthLogsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<AuthLog>,
  ): Promise<AuthLog[] | null> {
    return this.authAuthLogsService.delete(query);
  }
}
