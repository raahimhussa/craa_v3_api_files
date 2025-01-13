import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  FindQuery,
  PatchBody,
  MongoDelete,
} from 'src/common/interfaces/mongoose.entity';
import { User, UserDocument } from './schemas/users.schema';

@Injectable()
export default class UsersRepository {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
  ) {}

  public async create(user: any): Promise<User> {
    const newUser = await this.usersModel.create({
      ...user,
      isDeleted: false,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    return newUser.toObject();
  }

  public async bulkCreate(users: User[]) {
    try {
      await this.usersModel.insertMany(users);
      return true;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async getByEmail(email: string): Promise<User | null> {
    return this.usersModel
      .findOne({
        email,
      })
      .lean();
  }

  public async count(query: FindQuery<User>) {
    return this.usersModel
      .find(query.filter, query.projection, query.projection)
      .count();
  }

  public async findWithoutAggregation(query: FindQuery<User>) {
    return this.usersModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async find(query: FindQuery<User>) {
    const { filter, options, projection } = query;
    const _filter = { ...filter };
    if (_filter?._id?.$in) {
      _filter._id.$in = _filter._id.$in.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    let aggregationArray: any[] = [
      { $sort: { createdAt: -1 } },
      { $addFields: { role_id: { $toObjectId: '$roleId' } } },
      {
        $lookup: {
          from: 'roles',
          localField: 'role_id',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: { ..._filter } },
    ];

    if (
      typeof options?.skip === 'number' &&
      typeof options?.limit === 'number' &&
      options?.limit
    ) {
      aggregationArray.push({
        $skip: options.skip,
      });
      aggregationArray.push({
        $limit: options.limit,
      });
    }
    aggregationArray = [
      ...aggregationArray,

      {
        $lookup: {
          from: 'clientunits',
          let: { pid: '$profile.clientUnitId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$_id',
                    {
                      $convert: {
                        input: '$$pid',
                        to: 'objectId',
                        onError: '',
                        onNull: '',
                      },
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1, name: 1, titles: 1 } },
          ],
          as: 'client',
        },
      },
      {
        $unwind: {
          path: '$client',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'countries',
          let: { pid: '$profile.countryId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$_id',
                    {
                      $convert: {
                        input: '$$pid',
                        to: 'objectId',
                        onError: '',
                        onNull: '',
                      },
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1, name: 1 } },
          ],
          as: 'country',
        },
      },
      {
        $unwind: {
          path: '$country',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    if (options?.lookupWhitelist) {
      const lookup = [
        {
          $unwind: {
            path: '$authority.whitelist',
          },
        },
        {
          $addFields: {
            'authority.whitelist.clientId': {
              $toObjectId: '$authority.whitelist.clientId',
            },
          },
        },
        {
          $lookup: {
            from: 'clientunits',
            localField: 'authority.whitelist.clientId',
            foreignField: '_id',
            as: 'whitelist',
          },
        },
        {
          $unwind: {
            path: '$whitelist',
          },
        },
        {
          $group: {
            _id: '$_id',
            whitelist: {
              $push: {
                clientUnits: '$whitelist',
                permission: '$authority.whitelist',
              },
            },
            role: { $first: '$role' },
            profile: { $first: '$profile' },
            authority: { $first: '$authority' },
          },
        },
      ];
      aggregationArray.push(...lookup);
    }
    if (projection !== undefined) {
      aggregationArray.push({
        $project: {
          ...projection,
        },
      });
    }
    const aggregationQuery = this.usersModel.aggregate(aggregationArray);
    return await aggregationQuery;
  }

  public async findOne(query: FindQuery<User>) {
    const { filter, projection, options } = query;
    const _filter = { ...filter };
    if (_filter._id) {
      _filter._id = new mongoose.Types.ObjectId(filter._id);
    }
    const user = await this.usersModel.aggregate([
      {
        $match: {
          ..._filter,
        },
      },
      { $addFields: { role_id: { $toObjectId: '$roleId' } } },
      {
        $lookup: {
          from: 'roles',
          localField: 'role_id',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'clientunits',
          let: { pid: '$profile.clientUnitId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$_id',
                    {
                      $convert: {
                        input: '$$pid',
                        to: 'objectId',
                        onError: '',
                        onNull: '',
                      },
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1, name: 1, titles: 1 } },
          ],
          as: 'client',
        },
      },
      {
        $unwind: {
          path: '$client',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'countries',
          let: { pid: '$profile.countryId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$_id',
                    {
                      $convert: {
                        input: '$$pid',
                        to: 'objectId',
                        onError: '',
                        onNull: '',
                      },
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1, name: 1 } },
          ],
          as: 'country',
        },
      },
      {
        $unwind: {
          path: '$country',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (user.length != 0) return user[0];
    else return null;
  }

  public async getUserByUsername(username: string): Promise<User | null> {
    return this.usersModel
      .findOne({
        name: username,
      })
      .lean();
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return this.usersModel
      .findOne({
        email: email,
      })
      .lean();
  }

  public async getVerifiedUserByEmail(email: string): Promise<User | null> {
    return this.usersModel
      .findOne({
        email,
        verified: true,
      })
      .lean();
  }

  public async getUnverifiedUserByEmail(email: string): Promise<User | null> {
    return this.usersModel
      .findOne({
        email,
        verified: false,
      })
      .lean();
  }

  public async getById(id: any): Promise<User | null> {
    return this.usersModel
      .findOne(
        {
          _id: id,
        },
        { password: 0 },
      )
      .lean();
  }

  public async getVerifiedUserById(id: any): Promise<User | null> {
    return this.usersModel
      .findOne(
        {
          _id: id,
          verified: true,
        },
        { password: 0 },
      )
      .lean();
  }

  public async getUnverifiedUserById(id: any): Promise<User | null> {
    return this.usersModel
      .findOne(
        {
          _id: id,
          verified: false,
        },
        { password: 0 },
      )
      .lean();
  }

  public async findById(userId: string) {
    return this.usersModel.findById(userId).lean();
  }

  public async updateById(id: any, data: any): Promise<User | null> {
    return this.usersModel
      .findByIdAndUpdate(id, {
        $set: data,
      })
      .lean();
  }

  // public async getAllVerifiedWithPagination(options: PaginationParamsInterface): Promise<PaginatedUsersInterface> {
  //   const verified = true;
  //   const [users, totalCount] = await Promise.all([
  //     this.usersModel
  //       .find(
  //         {
  //           verified,
  //         },
  //         {
  //           password: 0,
  //         },
  //       )
  //       .limit(PaginationUtils.getLimitCount(options.limit))
  //       .skip(PaginationUtils.getSkipCount(options.page, options.limit))
  //       .lean(),
  //     this.usersModel.count({ verified }).lean(),
  //   ]);

  //   return { paginatedResult: users, totalCount };
  // }

  public async updateOne(
    query: PatchBody<UserDocument>,
  ): Promise<UserDocument | null> {
    const { filter, update } = query;
    const _update = {
      updatedAt: new Date(),
      ...update,
    };

    return this.usersModel.updateOne(filter, _update).lean();
  }

  public async updateOfflineBySocketId(socketId: string) {
    return this.usersModel.updateOne({
      status: {
        socketId: socketId,
      },
      update: {
        'status.online': false,
        'status.logoutAt': new Date(),
      },
    });
  }

  public async updateOnlineBySocketId(socketId: string) {
    return this.usersModel.updateOne({
      status: {
        socketId: socketId,
      },
      $set: {
        'status.online': false,
        'status.logoutAt': new Date(),
        'status.socketId': null,
      },
    });
  }

  public async updateMany(
    query: PatchBody<UserDocument>,
  ): Promise<UserDocument[] | null> {
    return this.usersModel
      .updateMany(query.filter, {
        ...query.update,
        $set: { ...query?.update!['$set'], updatedAt: new Date() },
      })
      .lean();
  }

  public async deleteOne(
    query: MongoDelete<UserDocument>,
  ): Promise<UserDocument | null> {
    const { filter, options } = query;
    return this.usersModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(query: MongoDelete<UserDocument>) {
    const { filter, options } = query;
    return this.usersModel.deleteMany(filter, options).lean();
  }
}
