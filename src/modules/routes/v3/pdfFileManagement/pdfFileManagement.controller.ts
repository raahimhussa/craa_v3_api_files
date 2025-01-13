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
import PdfFileManagementService from './pdfFileManagement.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { PdfFile, PdfFileCreateDto } from './dto/pdfFileManagement.dto';

@ApiTags('PdfFileManagement')
@Controller()
export class PdfFileManagementController {
  constructor(
    private readonly pdfFileManagementService: PdfFileManagementService,
  ) {}

  @ApiBody({})
  @Post()
  async create(@Body() pdfFileCreateDtos: PdfFileCreateDto[]) {
    return this.pdfFileManagementService.create(pdfFileCreateDtos);
  }

  @ApiQuery({})
  @Get()
  async find(@Query('path') path: string, @Query('name') name: string) {
    return this.pdfFileManagementService.find(path, name);
  }

  @ApiQuery({})
  @Get('search')
  async findWithSearch(@Query('searchString') searchString: string) {
    return this.pdfFileManagementService.findWithSearch(searchString);
  }

  @ApiQuery({})
  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.pdfFileManagementService.count(query);
  }
  @Patch()
  async update(@Body() pdfFileCreateDtos: PdfFileCreateDto[]) {
    return this.pdfFileManagementService.update(pdfFileCreateDtos);
  }

  @Patch('rename')
  async rename(
    @Body('id') id: string,
    @Body('changedName') changedName: string,
    @Body('type') type: string,
  ) {
    return this.pdfFileManagementService.rename(id, changedName, type);
  }

  @Delete()
  async delete(@Query(new parseQueryPipe()) query: MongoDelete<any>) {
    return this.pdfFileManagementService.delete(query);
  }
}
