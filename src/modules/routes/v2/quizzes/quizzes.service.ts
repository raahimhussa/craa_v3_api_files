import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { Injectable } from '@nestjs/common';
import { Quiz } from './schemas/quiz.schema';
import QuizDto from './dto/quiz';
import QuizzesRepository from './quizzes.repository';

@Injectable()
export default class QuizzesService {
  constructor(private readonly quizzesRepository: QuizzesRepository) {}

  public async create(quiz: QuizDto): Promise<Quiz | null> {
    return this.quizzesRepository.create(quiz);
  }

  public async find(query: MongoQuery<Quiz>): Promise<Quiz[] | null> {
    return this.quizzesRepository.find(query);
  }

  public async findOne(query: MongoQuery<Quiz>): Promise<Quiz | null> {
    return this.quizzesRepository.findOne(query);
  }

  public async findById(id: string): Promise<Quiz | null> {
    return this.quizzesRepository.findById(id);
  }

  public async update(quiz: Quiz): Promise<Quiz | null> {
    const body: MongoUpdate<Quiz> = {
      filter: { _id: quiz._id },
      update: quiz,
    };
    return this.quizzesRepository.update(body);
  }

  public async delete(query: MongoDelete<Quiz>): Promise<Quiz[] | null> {
    return this.quizzesRepository.deleteMany(query);
  }

  public async deleteOne(quizId: string): Promise<Quiz[] | null> {
    return this.quizzesRepository.deleteOne(quizId);
  }
}
