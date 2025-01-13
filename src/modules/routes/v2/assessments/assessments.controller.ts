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
import { Assessment } from './schemas/assessment.schema';
import AssessmentDto from './dto/assessment.dto';
import AssessmentsService from './assessments.service';
@ApiTags('Assessments')
@Controller()
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @ApiBody({ type: AssessmentDto })
  @Post()
  async create(@Body() assessment: any): Promise<Assessment | null> {
    return await this.assessmentsService.create(assessment);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Assessment>) {
    return this.assessmentsService.find(query);
  }

  @ApiQuery({})
  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<Assessment>) {
    return this.assessmentsService.count(query);
  }

  @ApiQuery({})
  @Get(':assessmentId')
  async findOne(
    @Param('assessmentId') assessmentId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Assessment>,
  ) {
    if (assessmentId === 'custom')
      return this.assessmentsService.findOne(query);

    return this.assessmentsService.findById(assessmentId);
  }

  @ApiQuery({})
  @Get('/:assessmentId/setAdjudicator')
  async getNeedToBeAdjudicate(@Param('assessmentId') assessmentId: string) {
    return this.assessmentsService.getNeedToBeAdjudicate(assessmentId);
  }

  @ApiBody({})
  @Patch()
  async update(
    @Body() body: MongoUpdate<Assessment>,
  ): Promise<Assessment | null> {
    return this.assessmentsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Assessment>,
  ): Promise<Assessment[] | null> {
    return this.assessmentsService.delete(query);
  }
}
