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
import TemplateDto from './dto/template.dto';
import { Template, TemplateDocument } from './schemas/template.schema';
import TemplatesService from './templates.service';

@ApiTags('Templates')
@Controller()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  async create(@Body() template: TemplateDto): Promise<Template | null> {
    return this.templatesService.create(template);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<TemplateDocument>) {
    return this.templatesService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<TemplateDocument>) {
    return this.templatesService.update(body);
  }

  @Delete(':templateId')
  async delete(@Param('templateId') templateId: MongoDelete<TemplateDocument>) {
    const query = {
      filter: {
        _id: templateId,
      },
    };
    return this.templatesService.delete(query);
  }
}
