import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Group, GroupDocument } from './schemas/group.schema';
import GroupDto from './dto/group.dto';

@Injectable()
export default class GroupsRepository {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  public async create(group: GroupDto): Promise<Group | null> {
    const newGroup = await this.groupModel.create(group);
    return newGroup.toObject();
  }

  public async find(query: MongoQuery<Group>): Promise<Group[] | null> {
    return this.groupModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Group>): Promise<Group | null> {
    return this.groupModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Group | null> {
    return this.groupModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Group>): Promise<Group | null> {
    const { filter, update, options } = body;

    return this.groupModel
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

  public async deleteMany(query: MongoDelete<Group>): Promise<Group[] | null> {
    const { filter, options } = query;
    return this.groupModel.deleteMany(filter, options).lean();
  }
}
