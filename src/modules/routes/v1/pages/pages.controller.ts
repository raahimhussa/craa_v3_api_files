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
import { MongoQuery, MongoUpdate } from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import PageDto from './dto/page.dto';
import { Page } from './schemas/page.schema';
import PagesService from './pages.service';
import { Response } from 'express';

@ApiTags('DocumentPages')
@Controller()
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async create(@Body() page: PageDto): Promise<Page | null> {
    return this.pagesService.create(page);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Page>) {
    return this.pagesService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Page>) {
    return this.pagesService.update(body);
  }

  @Delete(':pageId')
  async delete(@Param('pageId') pageId: string) {
    const query = {
      filter: {
        _id: pageId,
      },
    };
    return this.pagesService.delete(query);
  }
}
