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
  UserAssessmentCycle,
  UserAssessmentCycleDocument,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycle.schema';
import {
  UserAssessmentCycleSummary,
  UserAssessmentCycleSummaryDocument,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycleSummary.schema';

@Injectable()
export default class SimDistributionRepository {
  constructor(
    @InjectModel(UserAssessmentCycleSummary.name)
    private userAssessmentCycleSummaryModel: Model<UserAssessmentCycleSummaryDocument>,
  ) {}

  public async count(query: MongoQuery<any>) {
    return (
      await this.aggregateAll(query).match(query.filter).count('count')
    )?.[0]?.count;
  }

  public async find(query: MongoQuery<any>) {
    const { filter, options } = query;
    // return this.userAssessmentCycleModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    return this.aggregateAll(query)
      .match(filter)
      .skip(options?.skip ? options.skip : 0)
      .limit(options?.limit ? options.limit : 20);
  }

  public async findWithoutPagination(query: MongoQuery<any>) {
    const { filter, options } = query;
    // return this.userAssessmentCycleModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    return this.userAssessmentCycleSummaryModel.find({ filter, options });
  }

  public aggregateAll(query: MongoQuery<UserAssessmentCycle>) {
    const { filter, options } = query;
    return this.userAssessmentCycleSummaryModel.aggregate([
      { $sort: { 'userBaseline.submittedAt': -1 } },
      {
        $addFields: {
          assessmentCycleId: { $toObjectId: '$assessmentCycleId' },
          assessmentTypeId: { $toObjectId: '$assessmentTypeId' },
          clientUnitId: { $toObjectId: '$clientUnitId' },
        },
      },
      {
        $lookup: {
          from: 'assessmentCycles',
          localField: 'assessmentCycleId',
          foreignField: '_id',
          as: 'assessmentCycle',
        },
      },
      {
        $unwind: {
          path: '$assessmentCycle',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'assessmentTypes',
          localField: 'assessmentTypeId',
          foreignField: '_id',
          as: 'assessmentType',
        },
      },
      {
        $unwind: {
          path: '$assessmentType',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'clientunits',
          localField: 'clientUnitId',
          foreignField: '_id',
          as: 'clientUnit',
        },
      },
      {
        $unwind: {
          path: '$clientUnit',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }
}
