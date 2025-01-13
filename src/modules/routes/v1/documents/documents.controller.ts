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
import DocumentDto from './dto/documents.dto';
import { Document } from './schemas/document.schema';
import DocumentsService from './documents.service';
import { Response } from 'express';

@ApiTags('Documents')
@Controller()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async create(@Body() document: DocumentDto): Promise<Document | null> {
    return this.documentsService.create(document);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Document>) {
    return this.documentsService.find(query);
  }
  @ApiQuery({})
  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<Document>) {
    return this.documentsService.count(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Document>) {
    return this.documentsService.update(body);
  }

  @Delete(':documentId')
  async delete(@Param('documentId') documentId: string) {
    const query = {
      filter: {
        _id: documentId,
      },
    };
    return this.documentsService.delete(query);
  }
}
