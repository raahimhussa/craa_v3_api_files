import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { ClientUnit, ClientUnitDocument } from './schemas/clientUnit.schema';
import {
  ClientUnitDto,
  BusinessUnitDto,
  BusinessCycleDto,
} from './dto/clientUnit.dto';

@Injectable()
export default class ClientUnitsRepository {
  constructor(
    @InjectModel(ClientUnit.name)
    private clientUnitsModel: Model<ClientUnitDocument>,
  ) {}

  public async create(clientUnit: ClientUnitDto) {
    const newClientUnit = await this.clientUnitsModel.create({
      ...clientUnit,
    });
    return newClientUnit.toObject();
  }

  public async bulkCreate(clientUnits: ClientUnitDto[]) {
    await this.clientUnitsModel.insertMany(clientUnits);
  }

  public async find(query: FindQuery<ClientUnit>) {
    return this.clientUnitsModel
      .find(query.filter, query.projection, query.options)
      .sort({ createdAt: -1 })
      .lean();
  }

  public async count(query: FindQuery<ClientUnit>) {
    return this.clientUnitsModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async findOne(query: FindQuery<ClientUnit>) {
    return this.clientUnitsModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  async findById(clientUnitId: any): Promise<ClientUnit | null> {
    return this.clientUnitsModel.findById(clientUnitId).lean();
  }

  public async updateOne(
    body: PatchBody<ClientUnit>,
  ): Promise<ClientUnit | null> {
    await this.clientUnitsModel.updateOne(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.clientUnitsModel
      .updateOne(body.filter, body.update, body.options)
      .lean();
  }

  public async updateMany(
    body: PatchBody<ClientUnit>,
  ): Promise<ClientUnit[] | null> {
    await this.clientUnitsModel.updateMany(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.clientUnitsModel
      .updateMany(body.filter, body.update, body.options)
      .lean();
  }

  public async deleteOne(
    query: DeleteQuery<ClientUnit>,
  ): Promise<ClientUnit | null> {
    return this.clientUnitsModel.deleteOne(query.filter, query.options).lean();
  }

  public async deleteMany(
    query: DeleteQuery<ClientUnit>,
  ): Promise<ClientUnit[] | null> {
    return this.clientUnitsModel.deleteMany(query.filter, query.options).lean();
  }
}
