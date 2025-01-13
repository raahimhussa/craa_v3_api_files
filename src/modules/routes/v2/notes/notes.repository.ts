import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Note, NoteDocument } from './schemas/note.schema';
import NoteDto from './dto/note.dto';

@Injectable()
export default class NotesRepository {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  public async bulkCreate(notes: NoteDto[]) {
    return await this.noteModel.insertMany(notes);
  }

  public async create(note: NoteDto): Promise<Note | null> {
    const newNote = await this.noteModel.create(note);
    return newNote.toObject();
  }

  public async find(query: MongoQuery<Note>): Promise<Note[] | null> {
    return this.noteModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Note>): Promise<Note | null> {
    return this.noteModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Note | null> {
    return this.noteModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Note>): Promise<Note | null> {
    const { filter, update, options } = body;
    return this.noteModel
      .updateMany(
        filter,
        {
          ...update,
          updatedAt: Date.now(),
        },
        options,
      )
      .lean();
  }

  public async deleteMany(query: MongoDelete<Note>): Promise<Note[] | null> {
    const { filter, options } = query;
    return this.noteModel.deleteMany(filter, options).lean();
  }
}
