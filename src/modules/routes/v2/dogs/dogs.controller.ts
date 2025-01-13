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
import { Dog } from './schemas/dog.schema';
import DogDto from './dto/dog.dto';
import DogsService from './dogs.service';

@ApiTags('Dogs')
@Controller()
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @ApiBody({ type: DogDto })
  @Post()
  async create(@Body() dog: DogDto): Promise<Dog | null> {
    return this.dogsService.create(dog);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Dog>) {
    return this.dogsService.find(query);
  }

  @ApiQuery({})
  @Get(':dogId')
  async findOne(
    @Param('dogId') dogId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Dog>,
  ) {
    if (dogId === 'custom') return this.dogsService.findOne(query);

    return this.dogsService.findById(dogId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Dog>): Promise<Dog | null> {
    return this.dogsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Dog>,
  ): Promise<Dog[] | null> {
    return this.dogsService.delete(query);
  }
}
