import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import SubjectDto from './dto/subject.dto';

@Injectable()
export default class SubjectsRepository {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  public async create(subject: SubjectDto): Promise<Subject | null> {
    const newSubject = await this.subjectModel.create(subject);
    return newSubject.toObject();
  }

  public async find(query: MongoQuery<Subject>): Promise<Subject[] | null> {
    const { filter, projection, options } = query;
    return this.subjectModel.find(filter, projection, options).lean();
  }

  public async findOne(query: MongoQuery<Subject>): Promise<Subject | null> {
    const { filter, projection, options } = query;
    return this.subjectModel.findOne(filter, projection, options).lean();
  }

  public async updateOne(body: MongoUpdate<Subject>): Promise<Subject | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.subjectModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(
    body: MongoUpdate<Subject>,
  ): Promise<Subject[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.subjectModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(query: MongoDelete<Subject>): Promise<Subject | null> {
    const { filter, options } = query;
    return this.subjectModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<Subject>,
  ): Promise<Subject[] | null> {
    const { filter, options } = query;
    return this.subjectModel.deleteMany(filter, options).lean();
  }
}
