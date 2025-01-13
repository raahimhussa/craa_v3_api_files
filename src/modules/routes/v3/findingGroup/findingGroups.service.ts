import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { FindingGroup } from './schemas/findingGroup.schema';
import FindingGroupDto from './dto/findingGroup.dto';
import FindingGroupsRepository from './findingGroups.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class FindingGroupsService {
  constructor(
    private readonly findingGroupsRepository: FindingGroupsRepository,
  ) {}

  public async create(
    findingGroup: FindingGroupDto,
  ): Promise<FindingGroup | null> {
    const prev = await this.findingGroupsRepository.find({
      filter: {
        simulationId: findingGroup.simulationId,
        findingId: findingGroup.findingId,
      },
    });
    if (prev && prev.length > 0) return prev[0];
    return this.findingGroupsRepository.create(findingGroup);
  }

  public async bulkCreate(findingGroups: FindingGroupDto[]) {
    await this.findingGroupsRepository.bulkCreate(findingGroups);
  }

  public async find(
    query: MongoQuery<FindingGroup>,
  ): Promise<FindingGroup[] | null> {
    return this.findingGroupsRepository.find(query);
  }

  public async count(query: MongoQuery<FindingGroup>) {
    return this.findingGroupsRepository.count(query);
  }

  public async findOne(
    query: MongoQuery<FindingGroup>,
  ): Promise<FindingGroup | null> {
    return this.findingGroupsRepository.findOne(query);
  }

  public async findById(id: string): Promise<FindingGroup | null> {
    return this.findingGroupsRepository.findById(id);
  }

  public async update(body: MongoUpdate<FindingGroup>) {
    return this.findingGroupsRepository.update(body);
  }

  public async delete(body: MongoDelete<FindingGroup>) {
    return this.findingGroupsRepository.deleteMany(body);
  }
}
