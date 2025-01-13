import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  UserSimulation,
  UserSimulationDocument,
} from './schemas/userSimulation.schema';
import UserSimulationDto from './dto/userSimulation.dto';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class UserSimulationsRepository {
  constructor(
    @InjectModel(UserSimulation.name)
    private userSimulationModel: Model<UserSimulationDocument>,
  ) {}

  public async create(
    userSimulation: UserSimulationDto,
  ): Promise<UserSimulation | null> {
    const newUserSimulation = await this.userSimulationModel.create(
      userSimulation,
    );
    return newUserSimulation.toObject();
  }

  public async bulkCreate(userSimulations: UserSimulationDto[]) {
    try {
      await this.userSimulationModel.insertMany(userSimulations);
      return true;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async find(
    query: MongoQuery<UserSimulation>,
  ): Promise<UserSimulation[] | null> {
    const { filter, projection, options } = query;
    // return this.userSimulationModel.find(filter, projection).lean();
    const _filter = { ...filter };
    if (_filter?._id) {
      if (typeof _filter._id === 'string') {
        _filter._id = new mongoose.Types.ObjectId(_filter._id);
      }
      if (_filter?._id?.$in && typeof _filter?._id?.$in === 'object') {
        _filter._id.$in = [..._filter._id.$in].map(
          (_id) => new mongoose.Types.ObjectId(_id),
        );
      }
    }
    const aggregationArray = [];
    aggregationArray.push({
      $match: { ..._filter },
    });
    if (
      typeof options?.skip === 'number' &&
      typeof options?.limit === 'number'
    ) {
      aggregationArray.push({
        $skip: options?.skip ? options.skip : 0,
      });
      aggregationArray.push({
        $limit: options?.limit ? options.limit : 0,
      });
    }
    aggregationArray.push({
      $addFields: {
        simulationId: { $toObjectId: '$simulationId' },
      },
    });
    aggregationArray.push({
      $lookup: {
        from: 'simulations',
        localField: 'simulationId',
        foreignField: '_id',
        as: 'simulation',
      },
    });
    aggregationArray.push({
      $unwind: {
        path: '$simulation',
        preserveNullAndEmptyArrays: true,
      },
    });
    return this.userSimulationModel.aggregate(aggregationArray);
  }

  public async findWithoutAggregation(
    query: MongoQuery<UserSimulation>,
    select?: string,
  ): Promise<UserSimulation[] | null> {
    const { filter, projection, options } = query;
    const aggregationArray = [];
    aggregationArray.push({
      $match: { ...filter },
    });
    aggregationArray.push({
      $addFields: { user_id: { $toObjectId: '$userId' } },
    });

    aggregationArray.push({
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        pipeline: [
          {
            $unwind: '$profile',
          },
          { $project: { 'profile.clientUnitId': 1 } },
        ],
        as: 'user',
      },
    });
    aggregationArray.push({
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    });
    // aggregationArray.push({
    //   $limit: 5,
    // });
    aggregationArray.push({
      $project: { ...projection },
    });
    const indexSpecs: any = [{ key: { simulationId: 1 } }];
    try {
      this.userSimulationModel.createIndexes(indexSpecs);
    } catch (error) {
      console.log(error);
    }
    return this.userSimulationModel.aggregate(aggregationArray);
    // return (
    //   this.userSimulationModel
    //     .find(filter, projection, options)
    //     .lean()
    // );
  }
  // public async findWithoutAggregation(
  //   query: MongoQuery<UserSimulation>,
  //   select?: string,
  // ): Promise<UserSimulation[] | null> {
  //   const { filter, projection, options } = query;
  //   //@ts-ignore
  //   // this.userSimulationModel.createIndexes({ simulationId: 1 });
  //   return (
  //     this.userSimulationModel
  //       .find(filter, { 'results.scoreByDomain': 1 }, options)
  //       // .limit(10)
  //       .lean()
  //   );
  // }

  public async count(query: MongoQuery<UserSimulation>) {
    const { filter, projection } = query;
    return this.userSimulationModel.find(filter, projection).count();
  }

  public async findOne(
    query: MongoQuery<UserSimulation>,
  ): Promise<UserSimulation | null> {
    const { filter, projection, options } = query;
    return this.userSimulationModel.findOne(filter, projection, options).lean();
  }

  public async findById(id: string): Promise<UserSimulation | null> {
    return this.userSimulationModel.findById(id).lean();
  }

  public async update(
    body: MongoUpdate<UserSimulation>,
  ): Promise<UserSimulation[] | null> {
    const { filter, update, options } = body;
    return this.userSimulationModel
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

  // public async update(
  //   body: MongoUpdate<UserSimulation>,
  // ): Promise<UserSimulation | null> {
  //   const { filter, update } = body;
  //   console.log(filter._id)
  //   console.log(filter._id)
  //   return this.userSimulationModel
  //     .findByIdAndUpdate(filter._id, {
  //       $set: update,
  //     })
  //     .lean();
  // }

  public async deleteMany(
    query: MongoDelete<UserSimulation>,
  ): Promise<UserSimulation[] | null> {
    return this.userSimulationModel.deleteMany(query.filter).lean();
  }
}
