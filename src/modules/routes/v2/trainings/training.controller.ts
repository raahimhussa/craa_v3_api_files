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
import { Page, Training } from './schemas/training.schema';
import TrainingDto from './dto/training';
import TrainingsService from './training.service';

@ApiTags('Trainings')
@Controller()
export class TrainingsController {
  constructor(private readonly TrainingsService: TrainingsService) {}

  @ApiBody({ type: TrainingDto })
  @Post()
  async create(@Body() training: TrainingDto): Promise<Training | null> {
    return this.TrainingsService.create(training);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Training>) {
    return this.TrainingsService.find(query);
  }

  @ApiQuery({})
  @Get(':trainingId')
  async findOne(
    @Param('trainingId') trainingId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Training>,
  ) {
    if (trainingId === 'custom') return this.TrainingsService.findOne(query);

    return this.TrainingsService.findById(trainingId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() training: Training): Promise<Training | null> {
    return this.TrainingsService.update(training);
  }

  @ApiBody({})
  @Patch('/:trainingId/updatePage')
  async updatePage(
    @Param('trainingId') trainingId: string,
    @Body() page: Page,
  ): Promise<Training | null> {
    return this.TrainingsService.updatePage(trainingId, page);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Training>,
  ): Promise<Training[] | null> {
    return this.TrainingsService.delete(query);
  }

  @Delete(':trainingId')
  async deleteOne(
    @Param('trainingId') trainingId: string,
  ): Promise<Training[] | null> {
    return this.TrainingsService.deleteOne(trainingId);
  }
}
