import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import CreateAssessmentCycleDto from './dto/createAssessmentCycle.dto';
import {
  AssessmentCycle,
  AssessmentCycleDocument,
} from './assessmentCycle.schema';

@Injectable()
export default class AssessmentCyclesRepository {
  constructor(
    @InjectModel(AssessmentCycle.name)
    private assessmentCyclesModel: Model<AssessmentCycleDocument>,
  ) {}

  public async create(assessmentCycle: CreateAssessmentCycleDto) {
    const newAssessmentCycle = await this.assessmentCyclesModel.create({
      ...assessmentCycle,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    return newAssessmentCycle.toObject();
  }

  public async bulkCreate(assessmentCycles: CreateAssessmentCycleDto[]) {
    await this.assessmentCyclesModel.insertMany(assessmentCycles);
  }

  public async find(
    query: FindQuery<AssessmentCycle>,
  ): Promise<AssessmentCycle[] | null> {
    return this.assessmentCyclesModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async count(query: FindQuery<AssessmentCycle>) {
    return this.assessmentCyclesModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async findOne(
    query: FindQuery<AssessmentCycle>,
  ): Promise<AssessmentCycle | null> {
    return this.assessmentCyclesModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  async findById(id: any): Promise<AssessmentCycle | null> {
    return this.assessmentCyclesModel.findById(id).lean();
  }

  public async updateOne(
    body: PatchBody<AssessmentCycle>,
  ): Promise<AssessmentCycle | null> {
    await this.assessmentCyclesModel.updateOne(body.filter, {
      $set: { updatedAt: new Date() },
    });
    return this.assessmentCyclesModel
      .updateOne(body.filter, body.update, body.options)
      .lean();
  }

  public async updateMany(
    body: PatchBody<AssessmentCycle>,
  ): Promise<AssessmentCycle[] | null> {
    await this.assessmentCyclesModel.updateMany(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.assessmentCyclesModel
      .updateMany(body.filter, body.update, body.options)
      .lean();
  }

  public async deleteOne(
    query: DeleteQuery<AssessmentCycle>,
  ): Promise<AssessmentCycle | null> {
    return this.assessmentCyclesModel
      .deleteOne(query.filter, query.options)
      .lean();
  }

  public async deleteMany(
    query: DeleteQuery<AssessmentCycle>,
  ): Promise<AssessmentCycle[] | null> {
    return this.assessmentCyclesModel
      .deleteMany(query.filter, query.options)
      .lean();
  }
}
