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
import DocumentVariableGroupDto from './dto/documentVariableGroups.dto';
import { DocumentVariableGroup } from './schemas/documentVariableGroups.schema';
import DocumentVariableGroupsService from './documentVariableGroups.service';
import { Response } from 'express';

@ApiTags('DocumentVariableGroups')
@Controller()
export class DocumentVariableGroupsController {
  constructor(
    private readonly documentVariableGroupsService: DocumentVariableGroupsService,
  ) {}

  @Post()
  async create(
    @Body() documentVariableGroup: DocumentVariableGroupDto,
  ): Promise<DocumentVariableGroup | null> {
    return this.documentVariableGroupsService.create(documentVariableGroup);
  }

  @ApiQuery({})
  @Get()
  async find(
    @Query(new parseQueryPipe()) query: MongoQuery<DocumentVariableGroup>,
  ) {
    return this.documentVariableGroupsService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<DocumentVariableGroup>) {
    return this.documentVariableGroupsService.update(body);
  }

  @Delete(':documentVariableGroupId')
  async delete(
    @Param('documentVariableGroupId') documentVariableGroupId: string,
  ) {
    const query = {
      filter: {
        _id: documentVariableGroupId,
      },
    };
    return this.documentVariableGroupsService.delete(query);
  }
}
