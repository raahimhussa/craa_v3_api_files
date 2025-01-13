import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  MongoQuery,
  MongoUpdate,
  MongoDelete,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import SubjectDto from './dto/subject.dto';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import SubjectsService from './subjects.service';

@ApiTags('Subjects')
@Controller()
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  async create(@Body() subject: SubjectDto): Promise<Subject | null> {
    return this.subjectsService.create(subject);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<SubjectDocument>) {
    return this.subjectsService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<SubjectDocument>) {
    return this.subjectsService.update(body);
  }

  @ApiQuery({})
  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<SubjectDocument>,
  ) {
    return this.subjectsService.delete(query);
  }
}
