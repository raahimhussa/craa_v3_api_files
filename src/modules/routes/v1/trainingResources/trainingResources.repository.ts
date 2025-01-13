import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  MongoQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import {
  TrainingResourceDocument,
  TrainingResource,
} from './schemas/trainingResources.schema';
import CreateTrainingResourceDto from './dto/create-file.dto';

@Injectable()
export default class TrainingResourcesRepository {
  constructor(
    @InjectModel(TrainingResource.name)
    private trainingResourcesModel: Model<TrainingResourceDocument>,
  ) {}

  public async create(file: CreateTrainingResourceDto) {
    const newFile = await this.trainingResourcesModel.create({
      ...file,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    return newFile.toObject();
  }

  public async find(
    query: FindQuery<TrainingResource>,
  ): Promise<TrainingResourceDocument[] | null> {
    return this.trainingResourcesModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(
    query: FindQuery<TrainingResourceDocument>,
  ): Promise<TrainingResourceDocument | null> {
    return this.trainingResourcesModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async getNumberOfElement(
    query: MongoQuery<TrainingResource>,
  ): Promise<number> {
    return this.trainingResourcesModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async updateOne(
    query: PatchBody<TrainingResourceDocument>,
  ): Promise<TrainingResourceDocument | null> {
    await this.trainingResourcesModel.updateOne(query.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.trainingResourcesModel
      .updateOne(query.filter, query.update, query.options)
      .lean();
  }

  public async updateMany(
    query: PatchBody<TrainingResourceDocument>,
  ): Promise<TrainingResourceDocument[] | null> {
    await this.trainingResourcesModel.updateMany(query.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.trainingResourcesModel
      .updateMany(query.filter, query.update, query.options)
      .lean();
  }

  public async deleteOne(
    query: DeleteQuery<TrainingResourceDocument>,
  ): Promise<TrainingResourceDocument | null> {
    return this.trainingResourcesModel.deleteOne(query.filter).lean();
  }

  public async deleteMany(
    query: DeleteQuery<TrainingResourceDocument>,
  ): Promise<TrainingResourceDocument[] | null> {
    return this.trainingResourcesModel.deleteOne(query).lean();
  }
}
