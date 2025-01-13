import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import FoldersService from '../folders/folders.service';
import { Injectable } from '@nestjs/common';
import { Note } from './schemas/note.schema';
import NoteDto from './dto/note.dto';
import NotesRepository from './notes.repository';
import SimulationsRepository from '../../v1/simulations/simulations.repository';
import UserSimulationsRepository from '../userSimulations/userSimulations.repository';
import UsersRepository from '../../v1/users/users.repository';
import mongoose from 'mongoose';

@Injectable()
export default class NotesService {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly userSimulationsRepository: UserSimulationsRepository,
    private readonly simulationsRepository: SimulationsRepository,
    private readonly foldersService: FoldersService,
  ) {}

  public async bulkCreate(noteDtos: any[]) {
    return await this.notesRepository.bulkCreate(noteDtos);
  }

  public async create(noteDto: any): Promise<Note | null> {
    const noteId = new mongoose.Types.ObjectId();
    noteDto._id = noteId;
    if (noteDto.type === 'compliance') {
      noteDto.scorerCheck = {
        firstScorer: true,
        secondScorer: true,
      };
    }
    const note = await this.notesRepository.create(noteDto);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    note._id = noteId;
    return note;
  }

  public async createMNID(userSimulationId: string) {
    const userSimulation = await this.userSimulationsRepository.findById(
      userSimulationId,
    );
    const notes = await this.notesRepository.find({
      filter: {
        'viewport.userSimulationId': userSimulationId,
        reopenCount: userSimulation.reopenCount,
      },
    });
    const simulation = await this.simulationsRepository.findById(
      userSimulation.simulationId,
    );

    const { folderIds } = await this.simulationsRepository.findById(
      userSimulation.simulationId,
    );

    const subFolders = await this.foldersService.findByIds(folderIds);

    const subFolderIds = subFolders?.map((folder) => folder._id) || [];

    const totalFolderIds = [...folderIds, ...subFolderIds];

    const _ = require('lodash');
    const _notesGroupedByFolder = _.groupBy(
      notes,
      (note) => note.viewport?.simDoc?.folderId,
    );

    let MNID = userSimulation.reopenCount * 1000 || 0;
    totalFolderIds.forEach((folderId) => {
      const _notes = _notesGroupedByFolder[folderId];

      _notes
        ?.sort((a, b) => (a.seq - b.seq > 0 ? 1 : -1))
        ?.forEach((_note) => {
          this.notesRepository.update({
            filter: { _id: _note._id },
            update: {
              $set: { MNID: ++MNID },
            },
          });
        });
    });
  }

  public async find(query: MongoQuery<Note>): Promise<Note[] | null> {
    const notes = await this.notesRepository.find(query);
    const data = notes.map(async (_note) => {
      const userIds = _note?.nonErrors?.map((_nonError) => _nonError._id);
      const users =
        userIds && userIds.length > 0
          ? await this.usersRepository.find({
              filter: {
                _id: { $in: userIds },
              },
            })
          : null;
      return {
        ..._note,
        users,
      };
    });
    return Promise.all(data);
  }

  public async findOne(query: MongoQuery<Note>): Promise<Note | null> {
    return this.notesRepository.findOne(query);
  }

  public async findById(id: string): Promise<Note | null> {
    return this.notesRepository.findById(id);
  }

  public async update(body: MongoUpdate<Note>): Promise<Note | null> {
    return this.notesRepository.update(body);
  }

  public async delete(query: MongoDelete<Note>): Promise<Note[] | null> {
    return this.notesRepository.deleteMany(query);
  }
}
