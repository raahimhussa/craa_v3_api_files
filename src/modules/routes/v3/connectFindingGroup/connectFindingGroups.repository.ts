import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  ConnectFindingGroup,
  ConnectFindingGroupDocument,
} from './schemas/connectFindingGroup.schema';
import ConnectFindingGroupDto from './dto/connectFindingGroup.dto';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class ConnectFindingGroupsRepository {
  constructor(
    @InjectModel(ConnectFindingGroup.name)
    private connectFindingGroupModel: Model<ConnectFindingGroupDocument>,
  ) {}

  public async create(
    connectFindingGroup: ConnectFindingGroupDto,
  ): Promise<ConnectFindingGroup | null> {
    const newConnectFindingGroup = await this.connectFindingGroupModel.create(
      connectFindingGroup,
    );
    return newConnectFindingGroup.toObject();
  }

  public async bulkCreate(connectFindingGroups: ConnectFindingGroupDto[]) {
    await this.connectFindingGroupModel.insertMany(connectFindingGroups);
  }

  public async find(
    query: MongoQuery<ConnectFindingGroup>,
  ): Promise<ConnectFindingGroup[] | null> {
    try {
      const { filter, projection } = query;
      return this.connectFindingGroupModel.find(filter, projection);
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async count(query: MongoQuery<ConnectFindingGroup>) {
    const { filter, projection } = query;
    return this.connectFindingGroupModel.find(filter, projection).count();
  }

  public async findOne(
    query: MongoQuery<ConnectFindingGroup>,
  ): Promise<ConnectFindingGroup | null> {
    const { filter, projection, options } = query;
    return this.connectFindingGroupModel
      .findOne(filter, projection, options)
      .lean();
  }

  public async findById(id: string): Promise<ConnectFindingGroup | null> {
    return this.connectFindingGroupModel.findById(id).lean();
  }

  public async update(
    body: MongoUpdate<ConnectFindingGroup>,
  ): Promise<ConnectFindingGroup[] | null> {
    const { filter, update, options } = body;
    return this.connectFindingGroupModel
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
    query: MongoDelete<ConnectFindingGroup>,
  ): Promise<ConnectFindingGroup[] | null> {
    return this.connectFindingGroupModel.deleteMany(query.filter).lean();
  }
}
