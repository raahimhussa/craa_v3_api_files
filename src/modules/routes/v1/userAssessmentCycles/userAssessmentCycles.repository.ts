import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import {
  UserAssessmentCycle,
  UserAssessmentCycleDocument,
} from './schemas/userAssessmentCycle.schema';
import CreateUserAssessmentCycleDto from './dto/userAssessmentCycle.dto';
import { UserAssessmentCycleSummaryDocument } from './schemas/userAssessmentCycleSummary.schema';

@Injectable()
export default class UserAssessmentCyclesRepository {
  constructor(
    @InjectModel(UserAssessmentCycle.name)
    private userAssessmentCycleModel: Model<UserAssessmentCycleDocument>, // private userAssessmentCycleSummaryModel: Model<UserAssessmentCycleSummaryDocument>,
  ) {}

  public async create(userAssessmentCycle: CreateUserAssessmentCycleDto) {
    try {
      const newUserAssessmentCycle = await this.userAssessmentCycleModel.create(
        {
          ...userAssessmentCycle,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      );
      return newUserAssessmentCycle.toObject();
    } catch (e) {
      console.log({ e });
      throw e;
    }
  }

  public async bulkCreate(
    userAssessmentCycles: CreateUserAssessmentCycleDto[],
  ) {
    try {
      await this.userAssessmentCycleModel.insertMany(userAssessmentCycles);
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async migrationCount(query: FindQuery<UserAssessmentCycle>) {
    return this.userAssessmentCycleModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async count(query: FindQuery<UserAssessmentCycle>) {
    const { filter, projection, options } = query;
    if (filter.bu != undefined) {
      return this.userAssessmentCycleModel.aggregate([
        { $addFields: { user_id: { $toObjectId: '$userId' } } },
        { $addFields: { userBaseline_id: { $toObjectId: '$userBaselineId' } } },
        {
          $lookup: {
            from: 'userBaselines',
            localField: 'userBaseline_id',
            foreignField: '_id',
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
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            pipeline: [
              {
                $unwind: '$profile',
              },
              {
                $lookup: {
                  from: 'countries',
                  let: { pid: '$profile.countryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: [
                            '$_id',
                            {
                              $convert: {
                                input: '$$pid',
                                to: 'objectId',
                                onError: '',
                                onNull: '',
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'country',
                },
              },
              {
                $unwind: {
                  path: '$country',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: 'businessUnits',
                  let: { pid: '$profile.businessUnitId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: [
                            '$_id',
                            {
                              $convert: {
                                input: '$$pid',
                                to: 'objectId',
                                onError: '',
                                onNull: '',
                              },
                            },
                          ],
                        },
                      },
                    },

                    { $addFields: { client_id: { $toObjectId: '$clientId' } } },
                    {
                      $lookup: {
                        from: 'clients',
                        localField: 'client_id',
                        foreignField: '_id',
                        as: 'client',
                      },
                    },
                    {
                      $unwind: {
                        path: '$client',
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                  ],
                  as: 'businessUnit',
                },
              },
              {
                $unwind: {
                  path: '$businessUnit',
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
        {
          $facet: {
            total: [
              {
                $match: {
                  $and: [
                    { 'user.businessUnit.name': filter.bu ?? '' },
                    { 'user.businessUnit.client.name': filter.vendor ?? '' },
                  ],
                },
              },
              { $count: 'total' },
            ],
            started: [
              {
                $match: {
                  $and: [
                    { 'user.businessUnit.name': filter.bu ?? '' },
                    { 'user.businessUnit.client.name': filter.vendor ?? '' },
                    { 'userBaseline.status': 'inProgress' },
                  ],
                },
              },
              { $count: 'started' },
            ],
            completed: [
              {
                $match: {
                  $and: [
                    { 'user.businessUnit.name': filter.bu ?? '' },
                    { 'user.businessUnit.client.name': filter.vendor ?? '' },
                    { 'userBaseline.status': 'complete' },
                  ],
                },
              },
              { $count: 'completed' },
            ],
            notStarted: [
              {
                $match: {
                  $and: [
                    { 'user.businessUnit.name': filter.bu ?? '' },
                    { 'user.businessUnit.client.name': filter.vendor ?? '' },
                    { 'userBaseline.status': 'HasNotStarted' },
                  ],
                },
              },
              { $count: 'notStarted' },
            ],
          },
        },
        {
          $project: {
            total: { $arrayElemAt: ['$total.total', 0] },
            started: { $arrayElemAt: ['$started.started', 0] },
            completed: { $arrayElemAt: ['$completed.completed', 0] },
            notStarted: { $arrayElemAt: ['$notStarted.notStarted', 0] },
          },
        },
      ]);
    } else if (filter.bu == undefined && filter.vendor == undefined) {
      return this.userAssessmentCycleModel.aggregate([
        { $addFields: { user_id: { $toObjectId: '$userId' } } },
        { $addFields: { userBaseline_id: { $toObjectId: '$userBaselineId' } } },
        {
          $lookup: {
            from: 'userBaselines',
            localField: 'userBaseline_id',
            foreignField: '_id',
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
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            pipeline: [
              {
                $unwind: '$profile',
              },
              {
                $lookup: {
                  from: 'countries',
                  let: { pid: '$profile.countryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: [
                            '$_id',
                            {
                              $convert: {
                                input: '$$pid',
                                to: 'objectId',
                                onError: '',
                                onNull: '',
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'country',
                },
              },
              {
                $unwind: {
                  path: '$country',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: 'businessUnits',
                  let: { pid: '$profile.businessUnitId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: [
                            '$_id',
                            {
                              $convert: {
                                input: '$$pid',
                                to: 'objectId',
                                onError: '',
                                onNull: '',
                              },
                            },
                          ],
                        },
                      },
                    },

                    { $addFields: { client_id: { $toObjectId: '$clientId' } } },
                    {
                      $lookup: {
                        from: 'clients',
                        localField: 'client_id',
                        foreignField: '_id',
                        as: 'client',
                      },
                    },
                    {
                      $unwind: {
                        path: '$client',
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                  ],
                  as: 'businessUnit',
                },
              },
              {
                $unwind: {
                  path: '$businessUnit',
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
        {
          $facet: {
            total: [{ $count: 'total' }],
            started: [
              {
                $match: {
                  $and: [{ 'userBaseline.status': 'inProgress' }],
                },
              },
              { $count: 'started' },
            ],
            completed: [
              {
                $match: {
                  $and: [{ 'userBaseline.status': 'complete' }],
                },
              },
              { $count: 'completed' },
            ],
            notStarted: [
              {
                $match: {
                  $and: [{ 'userBaseline.status': 'HasNotStarted' }],
                },
              },
              { $count: 'notStarted' },
            ],
          },
        },
        {
          $project: {
            total: { $arrayElemAt: ['$total.total', 0] },
            started: { $arrayElemAt: ['$started.started', 0] },
            completed: { $arrayElemAt: ['$completed.completed', 0] },
            notStarted: { $arrayElemAt: ['$notStarted.notStarted', 0] },
          },
        },
      ]);
    } else {
      return this.userAssessmentCycleModel.aggregate([
        { $addFields: { user_id: { $toObjectId: '$userId' } } },
        { $addFields: { userBaseline_id: { $toObjectId: '$userBaselineId' } } },
        {
          $lookup: {
            from: 'userBaselines',
            localField: 'userBaseline_id',
            foreignField: '_id',
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
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            pipeline: [
              {
                $unwind: '$profile',
              },
              {
                $lookup: {
                  from: 'countries',
                  let: { pid: '$profile.countryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: [
                            '$_id',
                            {
                              $convert: {
                                input: '$$pid',
                                to: 'objectId',
                                onError: '',
                                onNull: '',
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'country',
                },
              },
              {
                $unwind: {
                  path: '$country',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: 'businessUnits',
                  let: { pid: '$profile.businessUnitId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: [
                            '$_id',
                            {
                              $convert: {
                                input: '$$pid',
                                to: 'objectId',
                                onError: '',
                                onNull: '',
                              },
                            },
                          ],
                        },
                      },
                    },

                    { $addFields: { client_id: { $toObjectId: '$clientId' } } },
                    {
                      $lookup: {
                        from: 'clients',
                        localField: 'client_id',
                        foreignField: '_id',
                        as: 'client',
                      },
                    },
                    {
                      $unwind: {
                        path: '$client',
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                  ],
                  as: 'businessUnit',
                },
              },
              {
                $unwind: {
                  path: '$businessUnit',
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
        {
          $facet: {
            total: [
              {
                $match: {
                  $and: [
                    { 'user.businessUnit.client.name': filter.vendor ?? '' },
                  ],
                },
              },
              { $count: 'total' },
            ],
            started: [
              {
                $match: {
                  $and: [
                    { 'user.businessUnit.client.name': filter.vendor ?? '' },
                    { 'userBaseline.status': 'inProgress' },
                  ],
                },
              },
              { $count: 'started' },
            ],
            completed: [
              {
                $match: {
                  $and: [
                    { 'user.businessUnit.client.name': filter.vendor ?? '' },
                    { 'userBaseline.status': 'complete' },
                  ],
                },
              },
              { $count: 'completed' },
            ],
            notStarted: [
              {
                $match: {
                  $and: [
                    { 'user.businessUnit.client.name': filter.vendor ?? '' },
                    { 'userBaseline.status': 'HasNotStarted' },
                  ],
                },
              },
              { $count: 'notStarted' },
            ],
          },
        },
        {
          $project: {
            total: { $arrayElemAt: ['$total.total', 0] },
            started: { $arrayElemAt: ['$started.started', 0] },
            completed: { $arrayElemAt: ['$completed.completed', 0] },
            notStarted: { $arrayElemAt: ['$notStarted.notStarted', 0] },
          },
        },
      ]);
    }
  }

  public async findWithJoin(query: FindQuery<UserAssessmentCycle>) {
    const { filter, projection, options } = query;
    return this.userAssessmentCycleModel.aggregate([
      { $match: { ...filter } },
      { $addFields: { user_id: { $toObjectId: '$userId' } } },
      { $addFields: { userBaseline_id: { $toObjectId: '$userBaselineId' } } },
      {
        $lookup: {
          from: 'userBaselines',
          localField: 'userBaseline_id',
          foreignField: '_id',
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
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          pipeline: [
            {
              $unwind: '$profile',
            },
            {
              $lookup: {
                from: 'countries',
                let: { pid: '$profile.countryId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [
                          '$_id',
                          {
                            $convert: {
                              input: '$$pid',
                              to: 'objectId',
                              onError: '',
                              onNull: '',
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
                as: 'country',
              },
            },
            {
              $unwind: {
                path: '$country',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'businessUnits',
                let: { pid: '$profile.businessUnitId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [
                          '$_id',
                          {
                            $convert: {
                              input: '$$pid',
                              to: 'objectId',
                              onError: '',
                              onNull: '',
                            },
                          },
                        ],
                      },
                    },
                  },

                  { $addFields: { client_id: { $toObjectId: '$clientId' } } },
                  {
                    $lookup: {
                      from: 'clients',
                      localField: 'client_id',
                      foreignField: '_id',
                      as: 'client',
                    },
                  },
                  {
                    $unwind: {
                      path: '$client',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'businessUnit',
              },
            },
            {
              $unwind: {
                path: '$businessUnit',
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
      {
        $lookup: {
          from: 'userFollowups',
          let: { userFollowupIds: '$userFollowupIds' },
          pipeline: [
            {
              $match: {
                $expr: { $in: [{ $toString: '$_id' }, '$$userFollowupIds'] },
              },
            },
          ],
          as: 'userFollowups',
        },
      },
    ]);
  }

  public async migrationFind(query: FindQuery<UserAssessmentCycle>) {
    // return this.userAssessmentCycleModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    const { filter } = query;
    let aggregationArray: any[] = [{ $match: { ...filter } }];
    if (
      typeof query?.options?.skip === 'number' &&
      typeof query?.options?.limit === 'number'
    ) {
      aggregationArray.push({ $skip: query.options.skip });
      aggregationArray.push({ $limit: query.options.limit });
    }
    aggregationArray = [
      ...aggregationArray,
      {
        $addFields: {
          user_id: { $toObjectId: '$userId' },
          clientUnitId: { $toObjectId: '$clientUnitId' },
          baseline_id: { $toObjectId: '$userBaselineId' },
        },
      },
      {
        $lookup: {
          from: 'clientunits',
          localField: 'clientUnitId',
          foreignField: '_id',
          as: 'clientUnit',
          pipeline: [{ $project: { _id: 1, name: 1, vendor: 1 } }],
        },
      },
      {
        $unwind: {
          path: '$clientUnit',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'userSimulations',
          localField: 'baseline_id',
          foreignField: '_id',
          as: 'userBaseline',
          pipeline: [
            {
              $addFields: {
                simulationId: { $toObjectId: '$simulationId' },
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
              $project: {
                results: {
                  // scoreByDomain: 0,
                  // scoreByMainDomain: 0,
                  // identifiedScoreBySeverity: 0,
                  // identifiedScoreByDomain: 0,
                  // identifiedScoreByMainDomain: 0,
                  identifiedAnswers: 0,
                  // identifiedFindings: 0,
                  notIdentifiedAnswers: 0,
                },
                instructions: 0,
                studyLogs: 0,
                protocols: 0,
              },
            },
          ],
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
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $addFields: {
                roleId: { $toObjectId: '$roleId' },
              },
            },
            {
              $lookup: {
                from: 'roles',
                localField: 'roleId',
                foreignField: '_id',
                as: 'role',
              },
            },
            {
              $unwind: {
                path: '$role',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: '$user.profile' },
      {
        $lookup: {
          from: 'userSimulations',
          let: { userFollowupIds: '$userFollowupIds' },
          pipeline: [
            {
              $match: {
                $expr: { $in: [{ $toString: '$_id' }, '$$userFollowupIds'] },
              },
            },
            {
              $addFields: {
                simulationId: { $toObjectId: '$simulationId' },
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
              $project: {
                results: {
                  // scoreByDomain: 0,
                  // scoreByMainDomain: 0,
                  // identifiedScoreBySeverity: 0,
                  // identifiedScoreByDomain: 0,
                  // identifiedScoreByMainDomain: 0,
                  identifiedAnswers: 0,
                  // identifiedFindings: 0,
                  notIdentifiedAnswers: 0,
                },
                instructions: 0,
                studyLogs: 0,
                protocols: 0,
              },
            },
          ],
          as: 'userFollowups',
        },
      },
      {
        $lookup: {
          from: 'userTrainings',
          let: { userTrainingIds: '$userTrainingIds' },
          pipeline: [
            {
              $match: {
                $expr: { $in: [{ $toString: '$_id' }, '$$userTrainingIds'] },
              },
            },
            { $project: { progresses: 0 } },
          ],
          as: 'userTrainings',
        },
      },
      { $project: { _id: 0 } },
    ];
    return this.userAssessmentCycleModel.aggregate(aggregationArray);
  }

  public async renewFind(query: FindQuery<UserAssessmentCycle>) {
    // return this.userAssessmentCycleModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    const { filter } = query;
    let aggregationArray: any[] = [{ $match: { ...filter } }];
    if (
      typeof query?.options?.skip === 'number' &&
      typeof query?.options?.limit === 'number'
    ) {
      aggregationArray.push({ $skip: query.options.skip });
      aggregationArray.push({ $limit: query.options.limit });
    }
    aggregationArray = [
      ...aggregationArray,
      {
        $addFields: {
          user_id: { $toObjectId: '$userId' },
          clientUnitId: { $toObjectId: '$clientUnitId' },
          baseline_id: { $toObjectId: '$userBaselineId' },
        },
      },
      {
        $lookup: {
          from: 'clientunits',
          localField: 'clientUnitId',
          foreignField: '_id',
          as: 'clientUnit',
          pipeline: [{ $project: { _id: 1, name: 1, vendor: 1 } }],
        },
      },
      {
        $unwind: {
          path: '$clientUnit',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'userSimulations',
          localField: 'baseline_id',
          foreignField: '_id',
          as: 'userBaseline',
          pipeline: [
            {
              $addFields: {
                simulationId: { $toObjectId: '$simulationId' },
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
              $project: {
                instructions: 0,
                studyLogs: 0,
                protocols: 0,
              },
            },
          ],
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
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $addFields: {
                roleId: { $toObjectId: '$roleId' },
              },
            },
            {
              $lookup: {
                from: 'roles',
                localField: 'roleId',
                foreignField: '_id',
                as: 'role',
              },
            },
            {
              $unwind: {
                path: '$role',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: '$user.profile' },
      {
        $lookup: {
          from: 'userSimulations',
          let: { userFollowupIds: '$userFollowupIds' },
          pipeline: [
            {
              $match: {
                $expr: { $in: [{ $toString: '$_id' }, '$$userFollowupIds'] },
              },
            },
            {
              $addFields: {
                simulationId: { $toObjectId: '$simulationId' },
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
              $project: {
                instructions: 0,
                studyLogs: 0,
                protocols: 0,
              },
            },
          ],
          as: 'userFollowups',
        },
      },
      {
        $lookup: {
          from: 'userTrainings',
          let: { userTrainingIds: '$userTrainingIds' },
          pipeline: [
            {
              $match: {
                $expr: { $in: [{ $toString: '$_id' }, '$$userTrainingIds'] },
              },
            },
          ],
          as: 'userTrainings',
        },
      },
    ];
    return this.userAssessmentCycleModel.aggregate(aggregationArray);
  }

  public async find(query: FindQuery<UserAssessmentCycle>) {
    // return this.userAssessmentCycleModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    const { filter } = query;
    return this.userAssessmentCycleModel.aggregate([
      { $match: { ...filter } },
      {
        $addFields: {
          user_id: { $toObjectId: '$userId' },
          clientUnitId: { $toObjectId: '$clientUnitId' },
          cycle_id: { $toObjectId: '$assessmentCycleId' },
          type_id: { $toObjectId: '$assessmentTypeId' },
          baseline_id: { $toObjectId: '$userBaselineId' },
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
      {
        $lookup: {
          from: 'assessmentCycles',
          localField: 'cycle_id',
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
          localField: 'type_id',
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
          from: 'userSimulations',
          localField: 'baseline_id',
          foreignField: '_id',
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
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $addFields: {
                roleId: { $toObjectId: '$roleId' },
              },
            },
            {
              $lookup: {
                from: 'roles',
                localField: 'roleId',
                foreignField: '_id',
                as: 'role',
              },
            },
            {
              $unwind: {
                path: '$role',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: '$user.profile' },
      {
        $lookup: {
          from: 'clients',
          let: { pid: '$user.profile.clientId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$_id',
                    {
                      $convert: {
                        input: '$$pid',
                        to: 'objectId',
                        onError: '',
                        onNull: '',
                      },
                    },
                  ],
                },
              },
            },
            // { $project: { _id: 1, name: 1 } },
          ],
          as: 'client',
        },
      },
      {
        $unwind: {
          path: '$client',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'userSimulations',
          let: { userFollowupIds: '$userFollowupIds' },
          pipeline: [
            {
              $match: {
                $expr: { $in: [{ $toString: '$_id' }, '$$userFollowupIds'] },
              },
            },
          ],
          as: 'userFollowups',
        },
      },
      {
        $lookup: {
          from: 'userTrainings',
          let: { userTrainingIds: '$userTrainingIds' },
          pipeline: [
            {
              $match: {
                $expr: { $in: [{ $toString: '$_id' }, '$$userTrainingIds'] },
              },
            },
          ],
          as: 'userTrainings',
        },
      },
    ]);
  }

  public async findOne(query: FindQuery<UserAssessmentCycle>) {
    return this.userAssessmentCycleModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async updateOne(
    body: PatchBody<UserAssessmentCycle>,
  ): Promise<UserAssessmentCycle | null> {
    const { filter, update, options } = body;
    return this.userAssessmentCycleModel
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
    body: PatchBody<UserAssessmentCycle>,
  ): Promise<UserAssessmentCycle[] | null> {
    const { filter, update, options } = body;
    return this.userAssessmentCycleModel
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
    query: DeleteQuery<UserAssessmentCycle>,
  ): Promise<UserAssessmentCycle | null> {
    return this.userAssessmentCycleModel
      .deleteOne(query.filter, query.options)
      .lean();
  }

  public async deleteMany(
    query: DeleteQuery<UserAssessmentCycle>,
  ): Promise<UserAssessmentCycle[] | null> {
    return this.userAssessmentCycleModel
      .deleteMany(query.filter, query.options)
      .lean();
  }
}
