import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  FindingGroup,
  FindingGroupDocument,
} from './schemas/findingGroup.schema';
import FindingGroupDto from './dto/findingGroup.dto';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class FindingGroupsRepository {
  constructor(
    @InjectModel(FindingGroup.name)
    private findingGroupModel: Model<FindingGroupDocument>,
  ) {}

  public async create(
    findingGroup: FindingGroupDto,
  ): Promise<FindingGroup | null> {
    const newFindingGroup = await this.findingGroupModel.create(findingGroup);
    return newFindingGroup.toObject();
  }

  public async bulkCreate(findingGroups: FindingGroupDto[]) {
    await this.findingGroupModel.insertMany(findingGroups);
  }

  public async find(
    query: MongoQuery<FindingGroup>,
  ): Promise<FindingGroup[] | null> {
    try {
      const { filter, projection } = query;
      return this.findingGroupModel.find(filter, projection);
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async count(query: MongoQuery<FindingGroup>) {
    const { filter, projection } = query;
    return this.findingGroupModel.find(filter, projection).count();
  }

  public async findOne(
    query: MongoQuery<FindingGroup>,
  ): Promise<FindingGroup | null> {
    const { filter, projection, options } = query;
    return this.findingGroupModel.findOne(filter, projection, options).lean();
  }

  public async findById(id: string): Promise<FindingGroup | null> {
    return this.findingGroupModel.findById(id).lean();
  }

  public async update(
    body: MongoUpdate<FindingGroup>,
  ): Promise<FindingGroup[] | null> {
    const { filter, update, options } = body;
    return this.findingGroupModel
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
    query: MongoDelete<FindingGroup>,
  ): Promise<FindingGroup[] | null> {
    return this.findingGroupModel.deleteMany(query.filter).lean();
  }
}
