import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import {
  TrainingLog,
  TrainingLogDocument,
} from './schemas/trainingLogs.schema';
import LogDto from './dto/log.dto';

@Injectable()
export default class TrainingLogsRepository {
  constructor(
    @InjectModel(TrainingLog.name) private logModel: Model<TrainingLogDocument>,
  ) {}

  public async create(log: LogDto): Promise<TrainingLog | null> {
    const newLog = await this.logModel.create(log);
    return newLog.toObject();
  }

  public async findForCount(
    query: MongoQuery<TrainingLog>,
  ): Promise<TrainingLog[] | null> {
    const { filter, options } = query;
    if (filter?.createdAt !== undefined) {
      if (filter?.createdAt['$gte'] !== '') {
        filter.createdAt['$gte'] = new Date(filter.createdAt['$gte']);
      } else {
        delete filter.createdAt['$gte'];
      }
      if (filter?.createdAt['$lte'] !== '') {
        filter.createdAt['$lte'] = new Date(filter.createdAt['$lte']);
      } else {
        delete filter?.createdAt['$lte'];
      }
      if (Object.keys(filter.createdAt).length === 0) {
        delete filter?.createdAt;
      }
    }
    return await this.logModel.aggregate([
      { $match: { ...filter } },
      {
        $addFields: {
          training_id: {
            $cond: {
              if: { $ne: ['$trainingId', ''] },
              then: { $toObjectId: '$trainingId' },
              else: null, // or any other value you want to set for empty `userSimulationId` fields
            },
          },
        },
      },
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
    // return this.logModel.find(query.filter, query.projection).lean();
  }
  public async find(
    query: MongoQuery<TrainingLog>,
  ): Promise<TrainingLog[] | null> {
    const { filter, options } = query;
    if (filter?.createdAt !== undefined) {
      if (filter?.createdAt['$gte'] !== '') {
        filter.createdAt['$gte'] = new Date(filter.createdAt['$gte']);
      } else {
        delete filter.createdAt['$gte'];
      }
      if (filter?.createdAt['$lte'] !== '') {
        filter.createdAt['$lte'] = new Date(filter.createdAt['$lte']);
      } else {
        delete filter?.createdAt['$lte'];
      }
      if (Object.keys(filter.createdAt).length === 0) {
        delete filter?.createdAt;
      }
    }
    return await this.logModel.aggregate([
      { $match: { ...filter } },
      {
        $addFields: {
          training_id: {
            $cond: {
              if: { $ne: ['$trainingId', ''] },
              then: { $toObjectId: '$trainingId' },
              else: null, // or any other value you want to set for empty `userSimulationId` fields
            },
          },
        },
      },
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
      { $sort: { createdAt: -1 } },
      {
        $skip: options?.skip ? options.skip : 0,
      },
      {
        $limit: options?.limit ? options.limit : 20,
      },
    ]);
    // return this.logModel.find(query.filter, query.projection).lean();
  }

  public async findOne(
    query: MongoQuery<TrainingLog>,
  ): Promise<TrainingLog | null> {
    return this.logModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<TrainingLog | null> {
    return this.logModel.findById(id).lean();
  }

  public async update(
    body: MongoUpdate<TrainingLog>,
  ): Promise<TrainingLog | null> {
    const { filter, update, options } = body;

    return this.logModel
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
    query: MongoDelete<TrainingLog>,
  ): Promise<TrainingLog[] | null> {
    const { filter, options } = query;
    return this.logModel.deleteMany(filter, options).lean();
  }
}
