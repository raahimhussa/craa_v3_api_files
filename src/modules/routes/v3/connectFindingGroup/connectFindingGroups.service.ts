import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { ConnectFindingGroup } from './schemas/connectFindingGroup.schema';
import ConnectFindingGroupDto from './dto/connectFindingGroup.dto';
import ConnectFindingGroupsRepository from './connectFindingGroups.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class ConnectFindingGroupsService {
  constructor(
    private readonly connectFindingGroupsRepository: ConnectFindingGroupsRepository,
  ) {}

  public async create(
    connectFindingGroup: ConnectFindingGroupDto,
  ): Promise<ConnectFindingGroup | null> {
    return this.connectFindingGroupsRepository.create(connectFindingGroup);
  }

  public async bulkCreate(connectFindingGroups: ConnectFindingGroupDto[]) {
    await this.connectFindingGroupsRepository.bulkCreate(connectFindingGroups);
  }

  public async find(
    query: MongoQuery<ConnectFindingGroup>,
  ): Promise<ConnectFindingGroup[] | null> {
    return this.connectFindingGroupsRepository.find(query);
  }

  public async count(query: MongoQuery<ConnectFindingGroup>) {
    return this.connectFindingGroupsRepository.count(query);
  }

  public async findOne(
    query: MongoQuery<ConnectFindingGroup>,
  ): Promise<ConnectFindingGroup | null> {
    return this.connectFindingGroupsRepository.findOne(query);
  }

  public async findById(id: string): Promise<ConnectFindingGroup | null> {
    return this.connectFindingGroupsRepository.findById(id);
  }

  public async update(body: MongoUpdate<ConnectFindingGroup>) {
    return this.connectFindingGroupsRepository.update(body);
  }

  public async delete(body: MongoDelete<ConnectFindingGroup>) {
    return this.connectFindingGroupsRepository.deleteMany(body);
  }
}
