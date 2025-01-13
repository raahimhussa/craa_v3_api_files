import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { Simulation, SimulationDocument } from './schemas/simulation.schema';
import CreateSimulationDto from './dto/createSimulation.dto';

@Injectable()
export default class SimulationsRepository {
  constructor(
    @InjectModel(Simulation.name)
    private simulationModel: Model<SimulationDocument>,
  ) {}

  public async create(
    simulation: CreateSimulationDto,
  ): Promise<Simulation | null> {
    const newSimulation = await this.simulationModel.create(simulation);
    return newSimulation.toObject();
  }

  public async find(
    query: FindQuery<Simulation>,
  ): Promise<Simulation[] | null> {
    return this.simulationModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async count(query: FindQuery<Simulation>) {
    return this.simulationModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async findOne(
    query: FindQuery<Simulation>,
  ): Promise<Simulation | null> {
    return this.simulationModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async updateOne(
    body: PatchBody<Simulation>,
  ): Promise<Simulation | null> {
    const { filter, update, options } = body;

    return this.simulationModel
      .updateOne(
        filter,
        {
          ...update,
          updatedAt: Date.now(),
        },
        options,
      )
      .lean();
  }

  public async updateMany(
    body: PatchBody<Simulation>,
  ): Promise<Simulation[] | null> {
    const { filter, update, options } = body;

    return this.simulationModel
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

  public async findById(simulationId: any): Promise<Simulation | null> {
    return this.simulationModel.findById(simulationId).lean();
  }

  public async deleteOne(
    query: DeleteQuery<Simulation>,
  ): Promise<Simulation | null> {
    return this.simulationModel.deleteOne(query.filter, query.options).lean();
  }

  public async deleteMany(
    query: DeleteQuery<Simulation>,
  ): Promise<Simulation[] | null> {
    return this.simulationModel.deleteMany(query.filter, query.options).lean();
  }

  async aggregate(pipeline: any[]): Promise<Simulation[] | null> {
    try {
      return await this.simulationModel.aggregate(pipeline).exec();
    } catch (error) {
      console.error('Error in aggregation: ', error);
      throw error;
    }
  }
}
