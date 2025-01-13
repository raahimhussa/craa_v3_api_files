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
import AssessmentTypeDto from './dto/assessmentType.dto';
import {
  AssessmentType,
  AssessmentTypeDocument,
} from './schemas/assessmentType.schema';
import AssessmentTypesService from './assessmentTypes.service';

@ApiTags('AssessmentTypes')
@Controller()
export class AssessmentTypesController {
  constructor(
    private readonly assessmentTypesService: AssessmentTypesService,
  ) {}

  @ApiBody({})
  @Post()
  async create(
    @Body() assessmentType: AssessmentTypeDto,
  ): Promise<AssessmentType | null> {
    return this.assessmentTypesService.create(assessmentType);
  }

  @ApiQuery({})
  @Get()
  async find(
    @Query(new parseQueryPipe()) query: MongoQuery<AssessmentTypeDocument>,
  ) {
    return this.assessmentTypesService.find(query);
  }

  @ApiQuery({})
  @Get('count')
  async count(
    @Query(new parseQueryPipe()) query: MongoQuery<AssessmentTypeDocument>,
  ) {
    return this.assessmentTypesService.count(query);
  }

  @ApiQuery({})
  @Get(':assessmentTypeId')
  async findOne(
    @Param('assessmentTypeId') assessmentTypeId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<AssessmentType>,
  ) {
    return this.assessmentTypesService.findById(assessmentTypeId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<AssessmentTypeDocument>) {
    return this.assessmentTypesService.update(body);
  }

  @Delete(':assessmentTypeId')
  async delete(
    @Param('assessmentTypeId')
    assessmentTypeId: MongoDelete<AssessmentTypeDocument>,
  ) {
    const query = {
      filter: {
        _id: assessmentTypeId,
      },
    };
    return this.assessmentTypesService.delete(query);
  }
}
