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
import { ScreenRecorder } from './schemas/screenRecorder.schema';
import ScreenRecorderDto from './dto/screenRecorder.dto';
import ScreenRecordersService from './screenRecorders.service';

@ApiTags('ScreenRecorders')
@Controller()
export class ScreenRecordersController {
  constructor(
    private readonly screenRecordersService: ScreenRecordersService,
  ) {}

  @ApiBody({ type: ScreenRecorderDto })
  @Post()
  async create(
    @Body() screenRecorder: ScreenRecorderDto,
  ): Promise<ScreenRecorder | null> {
    return this.screenRecordersService.create(screenRecorder);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<ScreenRecorder>) {
    return this.screenRecordersService.find(query);
  }

  @ApiQuery({})
  @Get(':screenRecorderId')
  async findOne(
    @Param('screenRecorderId') screenRecorderId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<ScreenRecorder>,
  ) {
    if (screenRecorderId === 'custom')
      return this.screenRecordersService.findOne(query);

    return this.screenRecordersService.findById(screenRecorderId);
  }

  @ApiBody({})
  @Patch()
  async update(
    @Body() body: MongoUpdate<ScreenRecorder>,
  ): Promise<ScreenRecorder | null> {
    return this.screenRecordersService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<ScreenRecorder>,
  ): Promise<ScreenRecorder[] | null> {
    return this.screenRecordersService.delete(query);
  }
}
