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
import { UserSimulationStatus } from 'src/utils/status';
import {
  UserAssessmentCycleSummary,
  UserAssessmentCycleSummaryDocument,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycleSummary.schema';

@Injectable()
export default class DashboardRepository {
  constructor(
    @InjectModel(UserAssessmentCycleSummary.name)
    private userAssessmentCycleSummaryModel: Model<UserAssessmentCycleSummaryDocument>,
  ) {}

  public async find(query: MongoQuery<any>) {
    const { filter, options } = query;
    const aggregateArray: any[] = [
      {
        $match: { ...filter },
      },
      {
        $project: {
          'user.createdAt': 1,
          'user.profile.title': 1,
          'user._id': 1,
          'user.profile.countryId': 1,
          status: 1,
          verified: 1,
          'userFollowups.status': 1,
          'userFollowups.domainId': 1,
          'userFollowups.resutls.scoreByMainDomain': 1,
          'userFollowups.publishedAt': 1,
          grade: 1,
          'userBaseline.results.scoreByMainDomain': 1,
          'clientUnit.name': 1,
        },
      },
    ];
    return await this.userAssessmentCycleSummaryModel.aggregate(aggregateArray);
  }
  // public async getTotalUserCount(query: MongoQuery<any>) {
  //   const { filter, options } = query;
  //   const aggregateArray: any[] = [
  //     {
  //       $match: { ...filter },
  //     },
  //   ];
  //   return await this.userAssessmentCycleSummaryModel.aggregate(aggregateArray);
  // }

  public async getAggregationCount(query: MongoQuery<any>) {
    const { filter, options } = query;
    const getSimStatusesOptions = () => {
      const simStatuses = options.fields.simStatuses;
      const ret = [];
      if (simStatuses.includes('Complete')) {
        [
          UserSimulationStatus.Scoring,
          UserSimulationStatus.Adjudicating,
          UserSimulationStatus.Reviewed,
          UserSimulationStatus.Published,
          UserSimulationStatus.Exported,
          UserSimulationStatus.Distributed,
        ].forEach((_status) => ret.push(_status));
      }
      if (simStatuses.includes(UserSimulationStatus.InProgress)) {
        ret.push(UserSimulationStatus.InProgress);
      }
      if (simStatuses.includes(UserSimulationStatus.Assigned)) {
        ret.push(UserSimulationStatus.Assigned);
      }
      return ret;
    };
    const aggregateArray: any[] = [
      {
        $match: { ...filter },
      },
      {
        $addFields: {
          assessmentCycleId: { $toObjectId: '$assessmentCycleId' },
          assessmentTypeId: { $toObjectId: '$assessmentTypeId' },
          userId: { $toObjectId: '$userId' },
          clientUnitId: { $toObjectId: '$clientUnitId' },
        },
      },
    ];
    if (query?.options?.fields?.simulationIds?.length > 0) {
      aggregateArray.push({
        $match: {
          $and: [
            {
              'userBaseline.simulationId': {
                $in: query.options.fields.simulationIds.map(
                  (_simulationId) => new mongoose.Types.ObjectId(_simulationId),
                ),
              },
            },
          ],
        },
      });
    }
    if (query?.options?.fields?.simStatuses?.length > 0) {
      aggregateArray.push({
        $match: {
          'userBaseline.status': {
            $in: getSimStatusesOptions(),
          },
        },
      });
    }
    if (query?.options?.fields?.resultStages?.length > 0) {
      aggregateArray.push({
        $match: {
          'userBaseline.status': {
            $in: query?.options?.fields?.resultStages,
          },
        },
      });
    }

    const count = await this.userAssessmentCycleSummaryModel
      .aggregate(aggregateArray)
      .count('totalCount');

    return count?.[0]?.totalCount || 0;
  }

  public getAggregation(query: MongoQuery<any>) {
    const { filter, options } = query;
    const getSimStatusesOptions = () => {
      const simStatuses = options.fields.simStatuses;
      const ret = [];
      if (simStatuses.includes('Complete')) {
        [
          UserSimulationStatus.Scoring,
          UserSimulationStatus.Adjudicating,
          UserSimulationStatus.Reviewed,
          UserSimulationStatus.Published,
          UserSimulationStatus.Exported,
          UserSimulationStatus.Distributed,
        ].forEach((_status) => ret.push(_status));
      }
      if (simStatuses.includes(UserSimulationStatus.InProgress)) {
        ret.push(UserSimulationStatus.InProgress);
      }
      if (simStatuses.includes(UserSimulationStatus.Assigned)) {
        ret.push(UserSimulationStatus.Assigned);
      }
      return ret;
    };
    let aggregateArray: any[] = [
      { $sort: { 'userBaseline.submittedAt': -1 } },
      {
        $match: { ...filter },
      },
      {
        $addFields: {
          assessmentCycleId: { $toObjectId: '$assessmentCycleId' },
          assessmentTypeId: { $toObjectId: '$assessmentTypeId' },
          userId: { $toObjectId: '$userId' },
          clientUnitId: { $toObjectId: '$clientUnitId' },
        },
      },
    ];
    if (query?.options?.fields?.simulationIds?.length > 0) {
      aggregateArray.push({
        $match: {
          $and: [
            {
              'userBaseline.simulationId': {
                $in: query.options.fields.simulationIds.map(
                  (_simulationId) => new mongoose.Types.ObjectId(_simulationId),
                ),
              },
            },
          ],
        },
      });
    }
    if (query?.options?.fields?.simStatuses?.length > 0) {
      aggregateArray.push({
        $match: {
          'userBaseline.status': {
            $in: getSimStatusesOptions(),
          },
        },
      });
    }
    if (query?.options?.fields?.resultStages?.length > 0) {
      aggregateArray.push({
        $match: {
          'userBaseline.status': {
            $in: query?.options?.fields?.resultStages,
          },
        },
      });
    }
    if (typeof query?.options?.skip === 'number') {
      aggregateArray.push({ $skip: query.options.skip });
    }
    if (typeof query?.options?.limit === 'number') {
      aggregateArray.push({ $limit: query.options.limit });
    }
    aggregateArray = [
      ...aggregateArray,
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
    ];
    return this.userAssessmentCycleSummaryModel.aggregate(aggregateArray);
  }

  public async findWithoutPagination(query: MongoQuery<any>) {
    const { filter, options } = query;
    // return this.userAssessmentCycleModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    return this.userAssessmentCycleSummaryModel.aggregate([
      { $sort: { 'userBaseline.submittedAt': -1 } },
      {
        $match: { ...filter },
      },
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
