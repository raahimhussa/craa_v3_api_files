import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  PatchBody,
  FindQuery,
  DeleteQuery,
} from 'src/common/interfaces/mongoose.entity';
import { parseQueryPipe } from 'src/common/pipes/parseQueryPipe';
import CreateDocDto from './dto/createDoc.dto';
import { DocsService } from './docs.service';
import { DocDocument } from './schemas/doc.schema';

@ApiTags('Docs')
@Controller()
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post()
  async create(@Body() createDocDto: CreateDocDto) {
    return this.docsService.create(createDocDto);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: FindQuery<DocDocument>) {
    return this.docsService.find(query);
  }

  @Patch()
  async update(@Body() body: PatchBody<DocDocument>) {
    return this.docsService.update(body);
  }

  @ApiQuery({})
  @Delete()
  async delete(@Query(new parseQueryPipe()) query: DeleteQuery<DocDocument>) {
    return this.docsService.delete(query);
  }
}
