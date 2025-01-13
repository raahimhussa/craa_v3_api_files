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
import TutorialDto from './dto/tutorial.dto';
import { Tutorial, TutorialDocument } from './schemas/tutorial.schema';
import TutorialsService from './tutorials.service';

@ApiTags('Tutorials')
@Controller()
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Post()
  async create(@Body() tutorial: TutorialDto): Promise<Tutorial | null> {
    return this.tutorialsService.create(tutorial);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<TutorialDocument>) {
    return this.tutorialsService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<TutorialDocument>) {
    return this.tutorialsService.update(body);
  }

  @Delete(':tutorialId')
  async delete(@Param('tutorialId') tutorialId: MongoDelete<TutorialDocument>) {
    const query = {
      filter: {
        _id: tutorialId,
      },
    };
    return this.tutorialsService.delete(query);
  }
}
