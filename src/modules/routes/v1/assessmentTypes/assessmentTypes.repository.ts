import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import AssessmentTypeDto from './dto/assessmentType.dto';
import {
  AssessmentType,
  AssessmentTypeDocument,
} from './schemas/assessmentType.schema';

@Injectable()
export default class AssessmentTypesRepository {
  constructor(
    @InjectModel(AssessmentType.name)
    private assessmentTypeModel: Model<AssessmentTypeDocument>,
  ) {}

  public async create(
    assessmentType: AssessmentTypeDto,
  ): Promise<AssessmentType | null> {
    const newAssessmentType = await this.assessmentTypeModel.create(
      assessmentType,
    );
    return newAssessmentType.toObject();
  }

  public async bulkCreate(assessmentTypes: AssessmentTypeDto[]) {
    const newAssessmentType = await this.assessmentTypeModel.insertMany(
      assessmentTypes,
    );
  }

  public async find(
    query: MongoQuery<AssessmentType>,
  ): Promise<AssessmentType[] | null> {
    const { filter, projection, options } = query;
    return this.assessmentTypeModel.find(filter, projection, options).lean();
  }

  public async count(query: MongoQuery<AssessmentType>) {
    const { filter, projection, options } = query;
    return this.assessmentTypeModel.find(filter, projection, options).count();
  }

  public async findOne(
    query: MongoQuery<AssessmentType>,
  ): Promise<AssessmentType | null> {
    const { filter, projection, options } = query;
    return this.assessmentTypeModel.findOne(filter, projection, options).lean();
  }

  public async findById(id: any): Promise<AssessmentType | null> {
    return this.assessmentTypeModel.findById(id).lean();
  }

  public async updateOne(
    body: MongoUpdate<AssessmentType>,
  ): Promise<AssessmentType | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.assessmentTypeModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(
    body: MongoUpdate<AssessmentType>,
  ): Promise<AssessmentType[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.assessmentTypeModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(
    query: MongoDelete<AssessmentType>,
  ): Promise<AssessmentType | null> {
    const { filter, options } = query;
    return this.assessmentTypeModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<AssessmentType>,
  ): Promise<AssessmentType[] | null> {
    const { filter, options } = query;
    return this.assessmentTypeModel.deleteMany(filter, options).lean();
  }
}
