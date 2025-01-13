import { UserSimulationDocument } from './../../v2/userSimulations/schemas/userSimulation.schema';
import mongoose, { Model } from 'mongoose';
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
export default class UserStatusManagementRepository {
  constructor(
    @InjectModel(UserAssessmentCycleSummary.name)
    private userAssessmentCycleSummaryModel: Model<UserAssessmentCycleSummaryDocument>,
  ) {}

  public async count(query: MongoQuery<any>) {
    const { filter } = query;
    return (
      (await this.aggregateAll({ filter, count: true }).count('count'))?.[0]
        ?.count || 0
    );
  }

  public async find(query: MongoQuery<any>) {
    const { filter, options } = query;

    return this.aggregateAll({
      filter,
      skip: options?.skip ? options.skip : 0,
      limit: options?.limit ? options.limit : 20,
    });
  }

  public aggregateAll({
    filter,
    skip,
    limit,
    count,
  }: {
    filter?: any;
    skip?: number;
    limit?: number;
    count?: boolean;
  }) {
    let aggregateArray = [];
    if (filter) {
      aggregateArray.push({ $match: { ...filter } });
    }

    aggregateArray = [
      { $sort: { 'userBaseline.submittedAt': -1 } },
      {
        $addFields: {
          clientUnit_Id: { $toObjectId: '$clientUnitId' },
        },
      },
      ...aggregateArray,
    ];
    if (!count) {
      aggregateArray = [...aggregateArray];
      if (typeof skip === 'number' && typeof limit === 'number') {
        aggregateArray.push({ $skip: skip });
        aggregateArray.push({ $limit: limit });
      }
      aggregateArray = [
        ...aggregateArray,
        {
          $lookup: {
            from: 'clientunits',
            localField: 'clientUnit_Id',
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
      ];
    }
    return this.userAssessmentCycleSummaryModel.aggregate(aggregateArray);
  }
}
