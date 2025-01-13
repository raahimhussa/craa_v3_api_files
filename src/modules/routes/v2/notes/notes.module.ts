import * as AutoIncrementFactory from 'mongoose-sequence';

import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Note, NoteSchema } from './schemas/note.schema';

import { Connection } from 'mongoose';
import FoldersModule from '../folders/folders.module';
import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import NotesRepository from './notes.repository';
import NotesService from './notes.service';
import SimulationsModule from '../../v1/simulations/simulations.module';
import UserSimulationsModule from '../userSimulations/userSimulations.module';
import UsersModule from '../../v1/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Note.name,
        useFactory: async (connection: Connection) => {
          const schema = NoteSchema;
          const autoIncrement = AutoIncrementFactory(connection);
          schema.plugin(autoIncrement, { id: 'note_seq', inc_field: 'seq' });

          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    UsersModule,
    UserSimulationsModule,
    SimulationsModule,
    FoldersModule,
  ],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
  exports: [NotesService, NotesRepository],
})
export default class NotesModule {}
