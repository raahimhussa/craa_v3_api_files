import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import AdminLogDao from './dao/adminLogdao';
import { AdminLog, AdminLogDocument } from './schemas/adminLog.schema';

@Injectable()
export default class AdminLogsRepository {
  constructor(
    @InjectModel(AdminLog.name) private logModel: Model<AdminLogDocument>,
  ) {}

  public async create(log: AdminLogDao): Promise<AdminLog | null> {
    try {
      const newAdminLog = await this.logModel.create(log);
      return newAdminLog.toObject();
    } catch (error) {
      console.log(error);
    }
  }

  public async count(query: MongoQuery<AdminLog>) {
    return this.logModel
      .find(query.filter, query.projection, query.projection)
      .count();
  }

  public async findForCount(
    query: MongoQuery<AdminLog>,
  ): Promise<AdminLog[] | null> {
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
    return await this.logModel.aggregate([
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
    // return this.logModel.find(query.filter, query.projection).lean();
  }
  public async findForTable(
    query: MongoQuery<AdminLog>,
  ): Promise<AdminLog[] | null> {
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
    return await this.logModel.aggregate([
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
    // return this.logModel.find(query.filter, query.projection).lean();
  }
  public async find(query: MongoQuery<AdminLog>): Promise<AdminLog[] | null> {
    const { filter, options } = query;
    return this.logModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<AdminLog>): Promise<AdminLog | null> {
    return this.logModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<AdminLog | null> {
    return this.logModel.findById(id).lean();
  }

  public async updateOne(
    body: MongoUpdate<AdminLog>,
  ): Promise<AdminLog | null> {
    const { filter, update, options } = body;

    return this.logModel
      .updateOne(
        filter,
        {
          ...update,
          updatedAt: Date.now(),
        },
        options,
      )
      .lean();
  }

  public async updateMany(
    body: MongoUpdate<AdminLog>,
  ): Promise<AdminLog[] | null> {
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
    query: MongoDelete<AdminLog>,
  ): Promise<AdminLog[] | null> {
    const { filter, options } = query;
    return this.logModel.deleteMany(filter, options).lean();
  }
}
