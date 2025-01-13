import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  SimulationAnnouncementTemplate,
  SimulationAnnouncementTemplateDocument,
} from './schemas/simulationAnnouncementTemplate.schema';
import SimulationAnnouncementTemplateDto from './dto/SimulationAnnouncementTemplateDocument.dto';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class SimulationAnnouncementTemplatesRepository {
  constructor(
    @InjectModel(SimulationAnnouncementTemplate.name)
    private simulationAnnouncementTemplateModel: Model<SimulationAnnouncementTemplateDocument>,
  ) {}

  public async create(
    simulationAnnouncementTemplate: SimulationAnnouncementTemplateDto,
  ): Promise<SimulationAnnouncementTemplate | null> {
    const newAgreement = await this.simulationAnnouncementTemplateModel.create(
      simulationAnnouncementTemplate,
    );
    return newAgreement.toObject();
  }

  public async count(query: MongoQuery<SimulationAnnouncementTemplate>) {
    const { filter, projection, options } = query;
    return this.simulationAnnouncementTemplateModel
      .find(filter, projection, options)
      .count();
  }

  public async find(
    query: MongoQuery<SimulationAnnouncementTemplate>,
  ): Promise<SimulationAnnouncementTemplate[] | null> {
    const { filter, projection, options } = query;
    return this.simulationAnnouncementTemplateModel
      .find(filter, projection, options)
      .lean();
  }

  public async findOne(
    query: MongoQuery<SimulationAnnouncementTemplate>,
  ): Promise<SimulationAnnouncementTemplate | null> {
    const { filter, projection, options } = query;
    return this.simulationAnnouncementTemplateModel
      .findOne(filter, projection, options)
      .lean();
  }

  public async updateOne(
    body: MongoUpdate<SimulationAnnouncementTemplate>,
  ): Promise<SimulationAnnouncementTemplate | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.simulationAnnouncementTemplateModel
      .updateOne(filter, _update, options)
      .lean();
  }

  public async updateMany(
    body: MongoUpdate<SimulationAnnouncementTemplate>,
  ): Promise<SimulationAnnouncementTemplate[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.simulationAnnouncementTemplateModel
      .updateMany(filter, _update, options)
      .lean();
  }

  public async deleteOne(
    query: MongoDelete<SimulationAnnouncementTemplate>,
  ): Promise<SimulationAnnouncementTemplate | null> {
    const { filter, options } = query;
    return this.simulationAnnouncementTemplateModel
      .deleteOne(filter, options)
      .lean();
  }

  public async deleteMany(
    query: MongoDelete<SimulationAnnouncementTemplate>,
  ): Promise<SimulationAnnouncementTemplate[] | null> {
    const { filter, options } = query;
    return this.simulationAnnouncementTemplateModel
      .deleteMany(filter, options)
      .lean();
  }
}
