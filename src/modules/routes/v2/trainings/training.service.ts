import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Page, Training } from './schemas/training.schema';

import { Injectable } from '@nestjs/common';
import TrainingDto from './dto/training';
import TrainingsRepository from './training.repository';
import mongoose from 'mongoose';

@Injectable()
export default class TrainingsService {
  constructor(private readonly trainingsRepository: TrainingsRepository) {}

  public async create(training: TrainingDto): Promise<Training | null> {
    return this.trainingsRepository.create(training);
  }

  public async bulkCreate(trainings: TrainingDto[]) {
    return this.trainingsRepository.bulkCreate(trainings);
  }

  public async find(query: MongoQuery<Training>): Promise<Training[] | null> {
    return this.trainingsRepository.find(query);
  }

  public async findOne(query: MongoQuery<Training>): Promise<Training | null> {
    return this.trainingsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Training | null> {
    return this.trainingsRepository.findById(id);
  }

  public async update(training: Training): Promise<Training | null> {
    const body: MongoUpdate<Training> = {
      filter: { _id: training._id },
      update: training,
    };
    return this.trainingsRepository.update(body);
  }

  public async updatePage(
    trainingId: string,
    page: Page,
  ): Promise<Training | null> {
    const pageId: string = page._id || new mongoose.Types.ObjectId().toString();
    const query: MongoUpdate<Training> = {
      filter: { _id: trainingId },
      update: {
        $set: {
          [`pages.${pageId}`]: {
            ...page,
            _id: pageId,
          },
        },
      },
    };
    return this.trainingsRepository.update(query);
  }

  public async delete(
    query: MongoDelete<Training>,
  ): Promise<Training[] | null> {
    return this.trainingsRepository.deleteMany(query);
  }

  public async deleteOne(trainingId: string): Promise<Training[] | null> {
    return this.trainingsRepository.deleteOne(trainingId);
  }
}
