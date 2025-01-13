import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { Injectable } from '@nestjs/common';
import { UserSimulation } from './schemas/userSimulation.schema';
import UserSimulationDto from './dto/userSimulation.dto';
import UserSimulationsRepository from './userSimulations.repository';

@Injectable()
export default class UserSimulationsService {
  constructor(
    private readonly userSimulationsRepository: UserSimulationsRepository,
  ) {}

  public async create(
    userSimulation: UserSimulationDto,
  ): Promise<UserSimulation | null> {
    return this.userSimulationsRepository.create(userSimulation);
  }

  public async find(
    query: MongoQuery<UserSimulation>,
  ): Promise<UserSimulation[] | null> {
    return this.userSimulationsRepository.find(query);
  }
  public async findWithoutAggregation(
    query: MongoQuery<UserSimulation>,
  ): Promise<UserSimulation[] | null> {
    return this.userSimulationsRepository.findWithoutAggregation(query);
  }

  public async count(query: MongoQuery<UserSimulation>) {
    return this.userSimulationsRepository.count(query);
  }

  public async findOne(
    query: MongoQuery<UserSimulation>,
  ): Promise<UserSimulation | null> {
    return this.userSimulationsRepository.findOne(query);
  }

  public async findById(id: string): Promise<UserSimulation | null> {
    return this.userSimulationsRepository.findById(id);
  }

  public async update(body: MongoUpdate<UserSimulation>) {
    return this.userSimulationsRepository.update(body);
  }

  public async delete(body: MongoDelete<UserSimulation>) {
    return this.userSimulationsRepository.deleteMany(body);
  }
}
