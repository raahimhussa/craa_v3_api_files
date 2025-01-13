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
import { Quiz } from './schemas/quiz.schema';
import QuizDto from './dto/quiz';
import QuizzesService from './quizzes.service';

@ApiTags('Quizzes')
@Controller()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @ApiBody({ type: QuizDto })
  @Post()
  async create(@Body() quiz: QuizDto): Promise<Quiz | null> {
    return this.quizzesService.create(quiz);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Quiz>) {
    return this.quizzesService.find(query);
  }

  @ApiQuery({})
  @Get(':quizId')
  async findOne(
    @Param('quizId') quizId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Quiz>,
  ) {
    if (quizId === 'custom') return this.quizzesService.findOne(query);

    return this.quizzesService.findById(quizId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() quiz: Quiz): Promise<Quiz | null> {
    return this.quizzesService.update(quiz);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Quiz>,
  ): Promise<Quiz[] | null> {
    return this.quizzesService.delete(query);
  }

  @Delete(':quizId')
  async deleteOne(@Param('quizId') quizId: string): Promise<Quiz[] | null> {
    return this.quizzesService.deleteOne(quizId);
  }
}
