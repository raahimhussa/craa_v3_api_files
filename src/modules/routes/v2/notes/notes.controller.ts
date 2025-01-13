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
import { Note } from './schemas/note.schema';
import NoteDto from './dto/note.dto';
import NotesService from './notes.service';

@ApiTags('Notes')
@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @ApiBody({ type: NoteDto })
  @Post()
  async create(@Body() note: NoteDto): Promise<Note | null> {
    return this.notesService.create(note);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Note>) {
    return this.notesService.find(query);
  }

  @ApiQuery({})
  @Get(':noteId')
  async findOne(
    @Param('noteId') noteId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Note>,
  ) {
    if (noteId === 'custom') return this.notesService.findOne(query);

    return this.notesService.findById(noteId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Note>): Promise<Note | null> {
    return this.notesService.update(body);
  }

  @ApiBody({})
  @Patch('userSimulations/:userSimulationId/mnid/create')
  async createMNID(@Param('userSimulationId') userSimulationId: string) {
    return this.notesService.createMNID(userSimulationId);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Note>,
  ): Promise<Note[] | null> {
    return this.notesService.delete(query);
  }
}
