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
import { KeyConcept } from './schemas/keyConcept.schema';
import KeyConceptDto from './dto/keyConcept.dto';
import KeyConceptsService from './keyConcepts.service';

@ApiTags('KeyConcepts')
@Controller()
export class KeyConceptsController {
  constructor(private readonly keyConceptsService: KeyConceptsService) {}

  @ApiBody({ type: KeyConceptDto })
  @Post()
  async create(@Body() keyConcept: KeyConceptDto): Promise<KeyConcept | null> {
    return this.keyConceptsService.create(keyConcept);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<KeyConcept>) {
    return this.keyConceptsService.find(query);
  }

  @ApiQuery({})
  @Get(':keyConceptId')
  async findOne(
    @Param('keyConceptId') keyConceptId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<KeyConcept>,
  ) {
    if (keyConceptId === 'custom')
      return this.keyConceptsService.findOne(query);

    return this.keyConceptsService.findById(keyConceptId);
  }

  @ApiBody({})
  @Patch()
  async update(
    @Body() body: MongoUpdate<KeyConcept>,
  ): Promise<KeyConcept | null> {
    return this.keyConceptsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<KeyConcept>,
  ): Promise<KeyConcept[] | null> {
    return this.keyConceptsService.delete(query);
  }
}
