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
import { Folder } from './schemas/folder.schema';
import FolderDto from './dto/folder.dto';
import FoldersService from './folders.service';

@ApiTags('Folders')
@Controller()
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @ApiBody({ type: FolderDto })
  @Post()
  async create(@Body() folder: FolderDto): Promise<Folder | null> {
    return this.foldersService.create(folder);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Folder>) {
    return this.foldersService.find(query);
  }

  @ApiQuery({})
  @Get(':folderId')
  async findOne(
    @Param('folderId') folderId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Folder>,
  ) {
    if (folderId === 'custom') return this.foldersService.findOne(query);

    return this.foldersService.findById(folderId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Folder>): Promise<Folder | null> {
    return this.foldersService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Folder>,
  ): Promise<Folder[] | null> {
    return this.foldersService.delete(query);
  }
}
