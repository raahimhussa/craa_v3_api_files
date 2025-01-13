import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import QuizDto from './dto/quiz';

@Injectable()
export default class QuizzesRepository {
  constructor(@InjectModel(Quiz.name) private quizModel: Model<QuizDocument>) {}

  public async create(dog: QuizDto): Promise<Quiz | null> {
    const newDog = await this.quizModel.create(dog);
    return newDog.toObject();
  }

  public async find(query: MongoQuery<Quiz>): Promise<Quiz[] | null> {
    return this.quizModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Quiz>): Promise<Quiz | null> {
    return this.quizModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Quiz | null> {
    return this.quizModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Quiz>): Promise<Quiz | null> {
    const { filter, update, options } = body;

    return this.quizModel
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

  public async deleteMany(query: MongoDelete<Quiz>): Promise<Quiz[] | null> {
    const { filter, options } = query;
    return this.quizModel.deleteMany(filter, options).lean();
  }

  public async deleteOne(quizId: string): Promise<Quiz[] | null> {
    const filter = { _id: quizId };
    const options = {};
    return this.quizModel.deleteOne(filter, options).lean();
  }
}
