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
import { Bookmark } from './schemas/bookmark.schema';
import BookmarkDto from './dto/bookmark.dto';
import BookmarksService from './bookmarks.service';

@ApiTags('Bookmarks')
@Controller()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @ApiBody({ type: BookmarkDto })
  @Post()
  async create(@Body() bookmark: BookmarkDto): Promise<Bookmark | null> {
    return this.bookmarksService.create(bookmark);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Bookmark>) {
    return this.bookmarksService.find(query);
  }

  @ApiQuery({})
  @Get(':bookmarkId')
  async findOne(
    @Param('bookmarkId') bookmarkId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Bookmark>,
  ) {
    if (bookmarkId === 'custom') return this.bookmarksService.findOne(query);

    return this.bookmarksService.findById(bookmarkId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Bookmark>): Promise<Bookmark | null> {
    return this.bookmarksService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Bookmark>,
  ): Promise<Bookmark[] | null> {
    return this.bookmarksService.delete(query);
  }
}
