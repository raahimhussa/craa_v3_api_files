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
import { Viewport } from './schemas/viewport.schema';
import ViewportDto from './dto/viewport.dto';
import ViewportsService from './viewports.service';

@ApiTags('Viewports')
@Controller()
export class ViewportsController {
  constructor(private readonly viewportsService: ViewportsService) {}

  @ApiBody({ type: ViewportDto })
  @Post()
  async create(@Body() viewport: ViewportDto): Promise<Viewport | null> {
    return this.viewportsService.create(viewport);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Viewport>) {
    return this.viewportsService.find(query);
  }

  @ApiQuery({})
  @Get(':viewportId')
  async findOne(
    @Param('viewportId') viewportId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Viewport>,
  ) {
    if (viewportId === 'custom') return this.viewportsService.findOne(query);
    return this.viewportsService.findById(viewportId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Viewport>): Promise<Viewport | null> {
    return this.viewportsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Viewport>,
  ): Promise<Viewport[] | null> {
    return this.viewportsService.delete(query);
  }
}
