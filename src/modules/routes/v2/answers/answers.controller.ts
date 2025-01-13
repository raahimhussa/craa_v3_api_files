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
import { Answer } from './schemas/answer.schema';
import AnswerDto from './dto/answer.dto';
import AnswersService from './answers.service';

@ApiTags('Answers')
@Controller()
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @ApiBody({ type: AnswerDto })
  @Post()
  async create(@Body() answer: AnswerDto): Promise<Answer | null> {
    return this.answersService.create(answer);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Answer>) {
    return this.answersService.find(query);
  }

  @ApiQuery({})
  @Get(':answerId')
  async findOne(
    @Param('answerId') answerId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Answer>,
  ) {
    if (answerId === 'custom') return this.answersService.findOne(query);

    return this.answersService.findById(answerId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Answer>): Promise<Answer | null> {
    return this.answersService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Answer>,
  ): Promise<Answer[] | null> {
    return this.answersService.delete(query);
  }
}
