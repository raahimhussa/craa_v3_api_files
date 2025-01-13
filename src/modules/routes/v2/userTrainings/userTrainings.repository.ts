import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  UserTraining,
  UserTrainingDocument,
} from './schemas/userTraining.schema';
import UserTrainingDto from './dto/userTraining.dto';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class UserTrainingsRepository {
  constructor(
    @InjectModel(UserTraining.name)
    private UserTrainingModel: Model<UserTrainingDocument>,
  ) {}

  public async create(
    UserTraining: UserTrainingDto,
  ): Promise<UserTraining | null> {
    const newUserTraining = await this.UserTrainingModel.create(UserTraining);
    return newUserTraining.toObject();
  }

  public async bulkCreate(userTrainings: UserTrainingDto[]) {
    return await this.UserTrainingModel.insertMany(userTrainings);
  }

  public async findWithOriginal(
    query: MongoQuery<UserTraining>,
    select?: string,
  ): Promise<UserTraining[] | null> {
    const { filter, projection, options } = query;
    return this.UserTrainingModel.find(filter, projection, options)
      .select(select)
      .lean();
  }

  public async find(
    query: MongoQuery<UserTraining>,
  ): Promise<UserTraining[] | null> {
    const { filter, projection } = query;
    return this.UserTrainingModel.aggregate([
      {
        $match: { ...filter },
      },
      { $addFields: { training_id: { $toObjectId: '$trainingId' } } },
      {
        $lookup: {
          from: 'trainings',
          localField: 'training_id',
          foreignField: '_id',
          as: 'training',
        },
      },
      {
        $unwind: {
          path: '$training',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }

  public async findOne(
    query: MongoQuery<UserTraining>,
  ): Promise<UserTraining | null> {
    const { filter, projection, options } = query;
    return this.UserTrainingModel.findOne(filter, projection, options).lean();
  }

  public async findById(id: string): Promise<UserTraining | null> {
    return this.UserTrainingModel.findById(id).lean();
  }

  public async update(
    body: MongoUpdate<UserTraining>,
  ): Promise<UserTraining[] | null> {
    const { filter, update, options } = body;
    return this.UserTrainingModel.updateMany(
      filter,
      {
        ...update,
        updatedAt: Date.now(),
      },
      options,
    ).lean();
  }

  public async deleteMany(
    query: MongoDelete<UserTraining>,
  ): Promise<UserTraining[] | null> {
    return this.UserTrainingModel.deleteMany(query.filter).lean();
  }

  public async deleteOne(
    userTrainingId: string,
  ): Promise<UserTraining[] | null> {
    const filter = { _id: userTrainingId };
    const options = {};
    return this.UserTrainingModel.deleteOne(filter, options).lean();
  }
}
