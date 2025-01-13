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
  Assessment,
  AssessmentDocument,
} from '../../v2/assessments/schemas/assessment.schema';
import {
  UserSimulation,
  UserSimulationDocument,
} from '../../v2/userSimulations/schemas/userSimulation.schema';
import {
  AssessmentType,
  AssessmentTypeDocument,
} from '../../v1/assessmentTypes/schemas/assessmentType.schema';
import {
  UserAssessmentCycle,
  UserAssessmentCycleDocument,
} from '../../v1/userAssessmentCycles/schemas/userAssessmentCycle.schema';

@Injectable()
export default class ScoringManagementRepository {
  constructor(
    @InjectModel(Assessment.name)
    private assessmentModel: Model<AssessmentDocument>,
    @InjectModel(UserSimulation.name)
    private userSimulationModel: Model<UserSimulationDocument>,
    @InjectModel(AssessmentType.name)
    private assessmentTypeModel: Model<AssessmentTypeDocument>,
    @InjectModel(UserAssessmentCycle.name)
    private userAssessmentCycleModel: Model<UserAssessmentCycleDocument>,
  ) {}

  public async count(query: MongoQuery<any>) {
    return this.assessmentModel
      .find(query.filter, query.projection, query.projection)
      .count();
  }

  public async find(query: MongoQuery<any>) {
    const { filter, options } = query;
    // return this.userAssessmentCycleModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    return this.assessmentModel.aggregate([
      { $match: { ...filter } },
      { $sort: { isExpedited: -1, createdAt: -1 } },
      {
        $skip: options?.skip ? options.skip : 0,
      },
      {
        $limit: options?.limit ? options.limit : 20,
      },
      {
        $addFields: {
          userSimulationId: { $toObjectId: '$userSimulationId' },
        },
      },
      {
        $lookup: {
          from: 'userSimulations',
          localField: 'userSimulationId',
          foreignField: '_id',
          pipeline: [
            {
              $addFields: {
                simulationId: { $toObjectId: '$simulationId' },
                userId: { $toObjectId: '$userId' },
              },
            },
            {
              $lookup: {
                from: 'simulations',
                localField: 'simulationId',
                foreignField: '_id',
                as: 'simulation',
              },
            },
            {
              $unwind: {
                path: '$simulation',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'userSimulation',
        },
      },
      {
        $unwind: {
          path: '$userSimulation',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }

  async getPreviewInfo(userSimulationId: string) {
    const finds = await this.userSimulationModel.aggregate([
      {
        $match: {
          _id: { $eq: new mongoose.Types.ObjectId(userSimulationId) },
        },
      },
      {
        $addFields: {
          userId: { $toObjectId: '$userId' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          pipeline: [
            {
              $addFields: {
                countryId: { $toObjectId: '$profile.countryId' },
              },
            },
            {
              $lookup: {
                from: 'countries',
                localField: 'countryId',
                foreignField: '_id',
                as: 'profile.country',
              },
            },
            {
              $unwind: {
                path: '$country',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return finds.length > 0 ? finds[0] : null;
  }

  async getBaselineResultSummary(userAssessmentCycleId: string) {
    const finds = await this.userAssessmentCycleModel.aggregate([
      {
        $match: {
          _id: { $eq: new mongoose.Types.ObjectId(userAssessmentCycleId) },
        },
      },
      {
        $addFields: {
          userBaselineId: { $toObjectId: '$userBaselineId' },
        },
      },
      {
        $lookup: {
          from: 'userSimulations',
          localField: 'userBaselineId',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'answers',
                let: {
                  userSimulationId: {
                    $toString: '$_id',
                  },
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$userSimulationId', '$$userSimulationId'],
                      },
                    },
                  },
                  {
                    $addFields: {
                      findingId: { $toObjectId: '$findingId' },
                    },
                  },
                  {
                    $lookup: {
                      from: 'findings',
                      localField: 'findingId',
                      foreignField: '_id',
                      pipeline: [
                        {
                          $addFields: {
                            domainId: { $toObjectId: '$domainId' },
                          },
                        },
                        {
                          $lookup: {
                            from: 'domains',
                            localField: 'domainId',
                            foreignField: '_id',
                            as: 'domain',
                          },
                        },
                        {
                          $unwind: {
                            path: '$domain',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      ],
                      as: 'finding',
                    },
                  },
                  {
                    $unwind: {
                      path: '$finding',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'answers',
              },
            },
          ],
          as: 'userBaseline',
        },
      },
      {
        $unwind: {
          path: '$userBaseline',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'userSimulations',
          let: {
            userFollowupIds: '$userFollowupIds',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [{ $toString: '$_id' }, '$$userFollowupIds'],
                },
              },
            },
            {
              $addFields: {
                domainId: { $toObjectId: '$domainId' },
              },
            },
            {
              $lookup: {
                from: 'answers',
                let: {
                  userSimulationId: {
                    $toString: '$_id',
                  },
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$userSimulationId', '$$userSimulationId'],
                      },
                    },
                  },
                  {
                    $addFields: {
                      findingId: { $toObjectId: '$findingId' },
                    },
                  },
                  {
                    $lookup: {
                      from: 'findings',
                      localField: 'findingId',
                      foreignField: '_id',
                      pipeline: [
                        {
                          $addFields: {
                            domainId: { $toObjectId: '$domainId' },
                          },
                        },
                        {
                          $lookup: {
                            from: 'domains',
                            localField: 'domainId',
                            foreignField: '_id',
                            as: 'domain',
                          },
                        },
                        {
                          $unwind: {
                            path: '$domain',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      ],
                      as: 'finding',
                    },
                  },
                  {
                    $unwind: {
                      path: '$finding',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'answers',
              },
            },
            {
              $lookup: {
                from: 'domains',
                localField: 'domainId',
                foreignField: '_id',
                pipeline: [
                  {
                    $lookup: {
                      from: 'keyConcepts',
                      let: {
                        domainId: {
                          $toString: '$_id',
                        },
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$domainId', '$$domainId'],
                            },
                          },
                        },
                      ],
                      as: 'keyConcepts',
                    },
                  },
                ],
                as: 'domain',
              },
            },
            {
              $unwind: {
                path: '$domain',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'userFollowups',
        },
      },
    ]);
    return finds.length > 0 ? finds[0] : null;
  }
}
