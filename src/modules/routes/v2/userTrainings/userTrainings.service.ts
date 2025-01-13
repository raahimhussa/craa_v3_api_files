import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import {
  PageProgress,
  PageProgresses,
  UserTraining,
} from './schemas/userTraining.schema';

import { Injectable } from '@nestjs/common';
import TrainingsRepository from '../trainings/training.repository';
import UserTrainingDto from './dto/userTraining.dto';
import { UserTrainingStatus } from 'src/utils/status';
import UserTrainingsRepository from './userTrainings.repository';
import mongoose from 'mongoose';
import { throwError } from 'rxjs';

@Injectable()
export default class UserTrainingsService {
  constructor(
    private readonly userTrainingsRepository: UserTrainingsRepository,
    private readonly trainingsRepository: TrainingsRepository,
  ) {}

  // public async create(
  //   userTraining: UserTraining,
  // ): Promise<UserTraining | null> {
  //   return this.userTrainingsRepository.create(userTraining);
  // }

  public async _create(
    userTraining: UserTrainingDto,
  ): Promise<UserTraining | null> {
    return this.userTrainingsRepository.create(userTraining);
  }

  public async bulkCreate(userTrainings: UserTrainingDto[]) {
    return this.userTrainingsRepository.bulkCreate(userTrainings);
  }

  public async findWithOriginal(
    query: MongoQuery<UserTraining>,
  ): Promise<UserTraining[] | null> {
    return this.userTrainingsRepository.findWithOriginal(query);
  }

  public async find(
    query: MongoQuery<UserTraining>,
  ): Promise<UserTraining[] | null> {
    return this.userTrainingsRepository.find(query);
  }

  public async findOne(
    query: MongoQuery<UserTraining>,
  ): Promise<UserTraining | null> {
    return this.userTrainingsRepository.findOne(query);
  }

  public async findById(id: string): Promise<UserTraining | null> {
    return this.userTrainingsRepository.findById(id);
  }

  public async update(body: MongoUpdate<UserTraining>) {
    return this.userTrainingsRepository.update(body);
  }

  public async delete(body: MongoDelete<UserTraining>) {
    return this.userTrainingsRepository.deleteMany(body);
  }

  public async deleteOne(
    userTrainingId: string,
  ): Promise<UserTraining[] | null> {
    return this.userTrainingsRepository.deleteOne(userTrainingId);
  }

  async create(
    assessmentCycleId: string,
    assessmentTypeId: string,
    trainingId: string,
    userId: string,
    domainId: string,
  ): Promise<string> {
    const training = await this.trainingsRepository.findOne({
      filter: { _id: trainingId },
    });
    const progresses: PageProgresses = {};
    Object.values(training?.pages || {}).forEach((_page) => {
      if (_page.isActivated) {
        const pageProgress: PageProgress = {
          pageId: _page._id,
          status: UserTrainingStatus.HasNotStarted,
          quizAnswers: {},
          videoTime: 0,
          videoWatchingTime: 0,
          quizScore: 0,
          screenTime: 0,
          totalScore: 0,
        };
        progresses[_page._id] = pageProgress;
      }
    });
    const userTraining: UserTraining = {
      _id: new mongoose.Types.ObjectId(),
      assessmentCycleId: assessmentCycleId,
      assessmentTypeId: assessmentTypeId,
      trainingId,
      progresses,
      summary: {
        allPages: [],
        completePages: [],
        videoTime: 0,
        videoWatchingTime: 0,
        quizScore: 0,
        screenTime: 0,
      },
      domainId: domainId,
      usageTime: 0,
      status: UserTrainingStatus.HasNotAssigned,
      userId: userId,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedAt: new Date(),
      startedAt: null,
      completedAt: undefined,
      demoId: '',
      isDemo: false,
    };

    await this.userTrainingsRepository.create(userTraining);

    return userTraining._id.toString();
  }

  async summarize(userTrainingId: string) {
    const userTraining = await this.userTrainingsRepository.findOne({
      filter: { _id: userTrainingId },
    });
    if (!userTraining) return;
    const summary: any = {
      allPages: [],
      completePages: [],
      videoTime: 0,
      quizScore: 0,
      screenTime: 0,
    };
    Object.values(userTraining.progresses).forEach((_pageProgress) => {
      summary.allPages.push(_pageProgress.pageId);
      _pageProgress.status === UserTrainingStatus.Complete &&
        summary.completePages.push(_pageProgress.pageId);
      summary.quizScore += _pageProgress.quizScore;
      summary.screenTime += _pageProgress.screenTime;
      summary.videoTime += _pageProgress.videoTime;
    });
    try {
      await this.userTrainingsRepository.update({
        filter: { _id: userTrainingId },
        update: {
          $set: {
            summary,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
