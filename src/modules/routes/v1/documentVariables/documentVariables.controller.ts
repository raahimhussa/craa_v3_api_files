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
import DocumentVariableDto from './dto/documentVariables.dto';
import { DocumentVariable } from './schemas/documentVariables.schema';
import DocumentVariablesService from './documentVariables.service';
import { Response } from 'express';

@ApiTags('DocumentVariables')
@Controller()
export class DocumentVariablesController {
  constructor(
    private readonly documentVariablesService: DocumentVariablesService,
  ) {}

  @Post()
  async create(
    @Body() documentVariable: DocumentVariableDto,
  ): Promise<DocumentVariable | null> {
    return this.documentVariablesService.create(documentVariable);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<DocumentVariable>) {
    return this.documentVariablesService.find(query);
  }

  @Get('count')
  async count(
    @Query(new parseQueryPipe()) query: MongoQuery<DocumentVariable>,
  ) {
    return this.documentVariablesService.count(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<DocumentVariable>) {
    return this.documentVariablesService.update(body);
  }

  @Delete(':documentVariableId')
  async delete(@Param('documentVariableId') documentVariableId: string) {
    const query = {
      filter: {
        _id: documentVariableId,
      },
    };
    return this.documentVariablesService.delete(query);
  }
}
