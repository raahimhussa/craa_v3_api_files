import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Policy, PolicyDocument } from './schemas/policy.schema';
import PolicyDto from './dto/policy.dto';

@Injectable()
export default class PolicysRepository {
  constructor(
    @InjectModel(Policy.name) private policyModel: Model<PolicyDocument>,
  ) {}

  public async create(policy: PolicyDto): Promise<Policy | null> {
    const newPolicy = await this.policyModel.create(policy);
    return newPolicy.toObject();
  }

  public async find(query: MongoQuery<Policy>): Promise<Policy[] | null> {
    return this.policyModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Policy>): Promise<Policy | null> {
    return this.policyModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Policy | null> {
    return this.policyModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Policy>): Promise<Policy | null> {
    const { filter, update, options } = body;

    return this.policyModel
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
    query: MongoDelete<Policy>,
  ): Promise<Policy[] | null> {
    const { filter, options } = query;
    return this.policyModel.deleteMany(filter, options).lean();
  }
}
