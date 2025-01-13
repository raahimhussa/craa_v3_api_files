import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Tutorial, TutorialDocument } from './schemas/tutorial.schema';
import TutorialDto from './dto/tutorial.dto';

@Injectable()
export default class TutorialsRepository {
  constructor(
    @InjectModel(Tutorial.name) private tutorialModel: Model<TutorialDocument>,
  ) {}

  public async create(tutorial: TutorialDto): Promise<Tutorial | null> {
    const newTutorial = await this.tutorialModel.create(tutorial);
    return newTutorial.toObject();
  }

  public async find(
    query: MongoQuery<TutorialDocument>,
  ): Promise<Tutorial[] | null> {
    const { filter, projection, options } = query;
    return this.tutorialModel.find(filter, projection, options).lean();
  }

  public async findOne(
    query: MongoQuery<TutorialDocument>,
  ): Promise<Tutorial | null> {
    const { filter, projection, options } = query;
    return this.tutorialModel.findOne(filter, projection, options).lean();
  }

  public async updateOne(
    body: MongoUpdate<TutorialDocument>,
  ): Promise<Tutorial | null> {
    const { filter, update, options } = body;
    console.log(filter);
    console.log(update);
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.tutorialModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(
    body: MongoUpdate<TutorialDocument>,
  ): Promise<Tutorial[] | null> {
    const { filter, update, options } = body;
    console.log(filter);
    console.log(update);
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.tutorialModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(
    query: MongoDelete<TutorialDocument>,
  ): Promise<Tutorial | null> {
    const { filter, options } = query;
    return this.tutorialModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<TutorialDocument>,
  ): Promise<Tutorial[] | null> {
    const { filter, options } = query;
    return this.tutorialModel.deleteMany(filter, options).lean();
  }
}
