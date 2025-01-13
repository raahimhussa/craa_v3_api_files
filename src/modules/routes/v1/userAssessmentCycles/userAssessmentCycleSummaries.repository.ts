import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import {
  UserAssessmentCycleSummary,
  UserAssessmentCycleSummaryDocument,
} from './schemas/userAssessmentCycleSummary.schema';
import CreateUserAssessmentCycleSummaryDto from './dto/userAssessmentCycleSummary.dto';

@Injectable()
export default class UserAssessmentCycleSummariesRepository {
  constructor(
    @InjectModel(UserAssessmentCycleSummary.name)
    private userAssessmentCycleSummaryModel: Model<UserAssessmentCycleSummaryDocument>,
  ) {}

  public async create(
    userAssessmentCycle: CreateUserAssessmentCycleSummaryDto,
  ) {
    try {
      const newUserAssessmentCycle =
        await this.userAssessmentCycleSummaryModel.create({
          ...userAssessmentCycle,
          updatedAt: new Date(),
          createdAt: new Date(),
        });
      return newUserAssessmentCycle.toObject();
    } catch (e) {
      console.log({ e });
      throw e;
    }
  }

  public async bulkCreate(
    userAssessmentCycleSummaries: CreateUserAssessmentCycleSummaryDto[],
  ) {
    try {
      await this.userAssessmentCycleSummaryModel.insertMany(
        userAssessmentCycleSummaries,
      );
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async count(query: FindQuery<UserAssessmentCycleSummary>) {
    return this.userAssessmentCycleSummaryModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async find(query: FindQuery<UserAssessmentCycleSummary>) {
    // const indexSpecs: any = [{ key: { 'userBaseline.userId': 1 } }];
    // try {
    //   this.userAssessmentCycleSummaryModel.createIndexes(indexSpecs);
    // } catch (error) {
    //   console.log(error);
    // }

    return this.userAssessmentCycleSummaryModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: FindQuery<UserAssessmentCycleSummary>) {
    return this.userAssessmentCycleSummaryModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async updateOne(
    body: PatchBody<UserAssessmentCycleSummary>,
  ): Promise<UserAssessmentCycleSummary | null> {
    const { filter, update, options } = body;
    return this.userAssessmentCycleSummaryModel
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
    body: PatchBody<UserAssessmentCycleSummary>,
  ): Promise<UserAssessmentCycleSummary[] | null> {
    const { filter, update, options } = body;
    return this.userAssessmentCycleSummaryModel
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

  public async deleteOne(
    query: DeleteQuery<UserAssessmentCycleSummary>,
  ): Promise<UserAssessmentCycleSummary | null> {
    return this.userAssessmentCycleSummaryModel
      .deleteOne(query.filter, query.options)
      .lean();
  }

  public async deleteMany(
    query: DeleteQuery<UserAssessmentCycleSummary>,
  ): Promise<UserAssessmentCycleSummary[] | null> {
    return this.userAssessmentCycleSummaryModel
      .deleteMany(query.filter, query.options)
      .lean();
  }
}
