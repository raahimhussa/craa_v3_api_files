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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  PatchBody,
  FindQuery,
  DeleteQuery,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { AssessmentCycleDocument } from './assessmentCycle.schema';
import { AssessmentCyclesService } from './assessmentCycles.service';

@ApiTags('AssessmentCycles')
@Controller()
export class AssessmentCyclesController {
  constructor(
    private readonly assessmentCyclesService: AssessmentCyclesService,
  ) {}

  @Post()
  async create(@Body() createAssessmentCycleDto: any) {
    return this.assessmentCyclesService.create(createAssessmentCycleDto);
  }

  @ApiQuery({})
  @Get()
  async find(
    @Query(new parseQueryPipe()) query: FindQuery<AssessmentCycleDocument>,
  ) {
    return this.assessmentCyclesService.find(query);
  }

  @ApiQuery({})
  @Get('count')
  async count(
    @Query(new parseQueryPipe()) query: FindQuery<AssessmentCycleDocument>,
  ) {
    return this.assessmentCyclesService.count(query);
  }

  @ApiQuery({})
  @Get(':assessmentCycleId')
  async findById(@Param('assessmentCycleId') assessmentCycleId: string) {
    return this.assessmentCyclesService.findById(assessmentCycleId);
  }

  @Patch()
  async update(@Body() body: PatchBody<AssessmentCycleDocument>) {
    return this.assessmentCyclesService.update(body);
  }

  @ApiQuery({})
  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: DeleteQuery<AssessmentCycleDocument>,
  ) {
    return this.assessmentCyclesService.delete(query);
  }
}
