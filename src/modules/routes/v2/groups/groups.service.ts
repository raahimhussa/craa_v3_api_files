import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import GroupDto from './dto/group.dto';
import GroupsRepository from './groups.repository';
import { Group } from './schemas/group.schema';

@Injectable()
export default class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  public async create(group: GroupDto): Promise<Group | null> {
    return this.groupsRepository.create(group);
  }

  public async find(query: MongoQuery<Group>): Promise<Group[] | null> {
    return this.groupsRepository.find(query);
  }

  public async findOne(query: MongoQuery<Group>): Promise<Group | null> {
    return this.groupsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Group | null> {
    return this.groupsRepository.findById(id);
  }

  public async update(body: MongoUpdate<Group>): Promise<Group | null> {
    return this.groupsRepository.update(body);
  }

  public async delete(query: MongoDelete<Group>): Promise<Group[] | null> {
    return this.groupsRepository.deleteMany(query);
  }
}
