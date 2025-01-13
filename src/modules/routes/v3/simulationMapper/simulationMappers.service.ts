import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { Injectable } from '@nestjs/common';
import { SimulationMapper } from './schemas/simulationMapper.schema';
import SimulationMapperDto from './dto/simulationMapper.dto';
import SimulationMappersRepository from './simulationMappers.repository';

@Injectable()
export default class SimulationMappersService {
  constructor(
    private readonly simulationMappersRepository: SimulationMappersRepository,
  ) {}

  public async create(
    simulationMapper: SimulationMapperDto,
  ): Promise<SimulationMapper | null> {
    const prev = await this.simulationMappersRepository.find({
      filter: {
        simulationId: simulationMapper.simulationId,
        findingId: simulationMapper.findingId,
      },
    });
    if (prev && prev.length > 0) return prev[0];
    return this.simulationMappersRepository.create(simulationMapper);
  }

  public async bulkCreate(simulationMappers: SimulationMapperDto[]) {
    await this.simulationMappersRepository.bulkCreate(simulationMappers);
  }

  public async find(
    query: MongoQuery<SimulationMapper>,
  ): Promise<SimulationMapper[] | null> {
    return this.simulationMappersRepository.find(query);
  }

  public async count(query: MongoQuery<SimulationMapper>) {
    return this.simulationMappersRepository.count(query);
  }

  public async findOne(
    query: MongoQuery<SimulationMapper>,
  ): Promise<SimulationMapper | null> {
    return this.simulationMappersRepository.findOne(query);
  }

  public async findById(id: string): Promise<SimulationMapper | null> {
    return this.simulationMappersRepository.findById(id);
  }

  public async update(body: MongoUpdate<SimulationMapper>) {
    return this.simulationMappersRepository.update(body);
  }

  public async delete(body: MongoDelete<SimulationMapper>) {
    return this.simulationMappersRepository.deleteMany(body);
  }
}
