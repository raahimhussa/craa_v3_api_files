import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  SimulationMapper,
  SimulationMapperDocument,
} from './schemas/simulationMapper.schema';
import SimulationMapperDto from './dto/simulationMapper.dto';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class SimulationMappersRepository {
  constructor(
    @InjectModel(SimulationMapper.name)
    private simulationMapperModel: Model<SimulationMapperDocument>,
  ) {}

  public async create(
    simulationMapper: SimulationMapperDto,
  ): Promise<SimulationMapper | null> {
    const newSimulationMapper = await this.simulationMapperModel.create(
      simulationMapper,
    );
    return newSimulationMapper.toObject();
  }

  public async bulkCreate(simulationMappers: SimulationMapperDto[]) {
    await this.simulationMapperModel.insertMany(simulationMappers);
  }

  public async find(
    query: MongoQuery<SimulationMapper>,
  ): Promise<SimulationMapper[] | null> {
    try {
      const { filter, projection } = query;
      return this.simulationMapperModel.find(filter, projection);
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async count(query: MongoQuery<SimulationMapper>) {
    const { filter, projection } = query;
    return this.simulationMapperModel.find(filter, projection).count();
  }

  public async findOne(
    query: MongoQuery<SimulationMapper>,
  ): Promise<SimulationMapper | null> {
    const { filter, projection, options } = query;
    return this.simulationMapperModel
      .findOne(filter, projection, options)
      .lean();
  }

  public async findById(id: string): Promise<SimulationMapper | null> {
    return this.simulationMapperModel.findById(id).lean();
  }

  public async update(
    body: MongoUpdate<SimulationMapper>,
  ): Promise<SimulationMapper[] | null> {
    const { filter, update, options } = body;
    return this.simulationMapperModel
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
    query: MongoDelete<SimulationMapper>,
  ): Promise<SimulationMapper[] | null> {
    return this.simulationMapperModel.deleteMany(query.filter).lean();
  }
}
