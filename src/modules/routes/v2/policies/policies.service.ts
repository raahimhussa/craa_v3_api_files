import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import PolicyDto from './dto/policy.dto';
import PolicysRepository from './policies.repository';
import { Policy } from './schemas/policy.schema';

@Injectable()
export default class PolicysService {
  constructor(private readonly policiesRepository: PolicysRepository) {}

  public async create(policy: PolicyDto): Promise<Policy | null> {
    return this.policiesRepository.create(policy);
  }

  public async find(query: MongoQuery<Policy>): Promise<Policy[] | null> {
    return this.policiesRepository.find(query);
  }

  public async findOne(query: MongoQuery<Policy>): Promise<Policy | null> {
    return this.policiesRepository.findOne(query);
  }

  public async findById(id: string): Promise<Policy | null> {
    return this.policiesRepository.findById(id);
  }

  public async update(body: MongoUpdate<Policy>): Promise<Policy | null> {
    return this.policiesRepository.update(body);
  }

  public async delete(query: MongoDelete<Policy>): Promise<Policy[] | null> {
    return this.policiesRepository.deleteMany(query);
  }
}
