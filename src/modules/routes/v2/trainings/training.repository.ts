import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Training, TrainingDocument } from './schemas/training.schema';
import TrainingDto from './dto/training';

@Injectable()
export default class TrainingsRepository {
  constructor(
    @InjectModel(Training.name) private TrainingModel: Model<TrainingDocument>,
  ) {}

  public async create(mod: TrainingDto): Promise<Training | null> {
    const newDog = await this.TrainingModel.create(mod);
    return newDog.toObject();
  }

  public async bulkCreate(trainings: TrainingDto[]) {
    return await this.TrainingModel.insertMany(trainings);
  }

  public async find(query: MongoQuery<Training>): Promise<Training[] | null> {
    if (query.options?.multi === false) {
      return this.TrainingModel.findOne(query.filter, query.projection).lean();
    }
    return this.TrainingModel.find(query.filter, query.projection).lean();
  }

  public async findOne(query: MongoQuery<Training>): Promise<Training | null> {
    return this.TrainingModel.findOne(
      query.filter,
      query.projection,
      query.options,
    ).lean();
  }

  public async findById(id: string): Promise<Training | null> {
    return this.TrainingModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Training>): Promise<Training | null> {
    const { filter, update, options } = body;
    return this.TrainingModel.updateMany(
      filter,
      {
        ...update,
        updatedAt: Date.now(),
      },
      options,
    ).lean();
  }

  public async deleteMany(
    query: MongoDelete<Training>,
  ): Promise<Training[] | null> {
    const { filter, options } = query;
    return this.TrainingModel.deleteMany(filter, options).lean();
  }

  public async deleteOne(quizId: string): Promise<Training[] | null> {
    const filter = { _id: quizId };
    const options = {};
    return this.TrainingModel.deleteOne(filter, options).lean();
  }
}
