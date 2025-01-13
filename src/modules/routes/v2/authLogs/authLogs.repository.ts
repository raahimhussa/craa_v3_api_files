import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import AuthLogDto from './dto/authLog.dto';
import { AuthLog, AuthLogDocument } from './schemas/authLog.schema';

@Injectable()
export default class AuthLogsRepository {
  constructor(
    @InjectModel(AuthLog.name) private authAuthLogModel: Model<AuthLogDocument>,
  ) {}

  public async create(authAuthLog: AuthLogDto): Promise<AuthLog | null> {
    try {
      const newAuthLog = await this.authAuthLogModel.create(authAuthLog);
      return newAuthLog.toObject();
    } catch (error) {
      console.log(error);
    }
  }

  public async count(query: MongoQuery<AuthLog>) {
    return this.authAuthLogModel
      .find(query.filter, query.projection, query.projection)
      .count();
  }

  public async findForCount(
    query: MongoQuery<AuthLog>,
  ): Promise<AuthLog[] | null> {
    const { filter, options } = query;
    if (filter.createdAt !== undefined) {
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
    return await this.authAuthLogModel.aggregate([
      { $match: { ...filter } },
      {
        $addFields: {
          sim_id: {
            $cond: {
              if: { $ne: ['$userSimulationId', ''] },
              then: { $toObjectId: '$userSimulationId' },
              else: null, // or any other value you want to set for empty `userSimulationId` fields
            },
          },
        },
      },
      {
        $lookup: {
          from: 'simulations',
          localField: 'sim_id',
          foreignField: '_id',
          as: 'simulation',
        },
      },
      {
        $unwind: {
          path: '$simulation',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    // return this.authAuthLogModel.find(query.filter, query.projection).lean();
  }
  public async findForTable(
    query: MongoQuery<AuthLog>,
  ): Promise<AuthLog[] | null> {
    const { filter, options } = query;
    if (filter?.createdAt !== undefined) {
      if (filter?.createdAt['$gte'] !== '') {
        filter.createdAt['$gte'] = new Date(filter.createdAt['$gte']);
      } else {
        delete filter?.createdAt['$gte'];
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
    return await this.authAuthLogModel.aggregate([
      { $match: { ...filter } },
      {
        $addFields: {
          sim_id: {
            $cond: {
              if: { $ne: ['$userSimulationId', ''] },
              then: { $toObjectId: '$userSimulationId' },
              else: null, // or any other value you want to set for empty `userSimulationId` fields
            },
          },
        },
      },
      {
        $lookup: {
          from: 'simulations',
          localField: 'sim_id',
          foreignField: '_id',
          as: 'simulation',
        },
      },
      {
        $unwind: {
          path: '$simulation',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: options?.skip ? options.skip : 0,
      },
      {
        $limit: options?.limit ? options.limit : 20,
      },
    ]);
    // return this.authAuthLogModel.find(query.filter, query.projection).lean();
  }
  public async find(query: MongoQuery<AuthLog>): Promise<AuthLog[] | null> {
    const { filter, options } = query;
    return this.authAuthLogModel.find(query.filter, query.projection).lean();
  }

  public async findOne(query: MongoQuery<AuthLog>): Promise<AuthLog | null> {
    return this.authAuthLogModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<AuthLog | null> {
    return this.authAuthLogModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<AuthLog>): Promise<AuthLog | null> {
    const { filter, update, options } = body;

    return this.authAuthLogModel
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
    query: MongoDelete<AuthLog>,
  ): Promise<AuthLog[] | null> {
    const { filter, options } = query;
    return this.authAuthLogModel.deleteMany(filter, options).lean();
  }
}
