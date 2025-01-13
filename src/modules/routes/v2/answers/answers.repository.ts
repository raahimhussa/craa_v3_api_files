import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Answer, AnswerDocument } from './schemas/answer.schema';
import AnswerDto from './dto/answer.dto';

@Injectable()
export default class AnswersRepository {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
  ) {}

  public async create(answer: AnswerDto): Promise<Answer | null> {
    const newAnswer = await this.answerModel.create(answer);
    return newAnswer.toObject();
  }

  public async find(query: MongoQuery<Answer>): Promise<Answer[] | null> {
    return this.answerModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Answer>): Promise<Answer | null> {
    return this.answerModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Answer | null> {
    return this.answerModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Answer>): Promise<Answer | null> {
    const { filter, update, options } = body;

    return this.answerModel
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

  public async deleteMany(
    query: MongoDelete<Answer>,
  ): Promise<Answer[] | null> {
    const { filter, options } = query;
    return this.answerModel.deleteMany(filter, options).lean();
  }

  public async insertMany(answers: Answer[]) {
    return this.answerModel.insertMany(answers);
  }
}
