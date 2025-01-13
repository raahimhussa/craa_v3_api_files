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
import { PdfFolder } from './schemas/pdfFolder.schema';
import { PdfFolderDto } from './dto/pdfFolder.dto';
import FoldersService from './pdfFolders.service';

@ApiTags('Folders')
@Controller()
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @ApiBody({ type: PdfFolderDto })
  @Post()
  async create(@Body() folder: PdfFolderDto): Promise<PdfFolder | null> {
    return this.foldersService.create(folder);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<PdfFolder>) {
    return this.foldersService.find(query);
  }

  @ApiQuery({})
  @Get('root')
  async getRootFolder() {
    return this.foldersService.getRootFolder();
  }

  @ApiBody({})
  @Patch()
  async update(
    @Body() body: MongoUpdate<PdfFolder>,
  ): Promise<PdfFolder | null> {
    return this.foldersService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<PdfFolder>,
  ): Promise<PdfFolder[] | null> {
    return this.foldersService.delete(query);
  }
}
