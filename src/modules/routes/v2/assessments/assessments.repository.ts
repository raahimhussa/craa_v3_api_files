import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Assessment, AssessmentDocument } from './schemas/assessment.schema';
import AssessmentDto from './dto/assessment.dto';
import { AnswerStatus } from 'src/utils/status';
import CreateAssessmentDao from './dto/createAssessment.dto';

// Original find not working, this is a quick-n-dirtry workaround for now.
import { UserSimulation, UserSimulationDocument } from '../userSimulations/schemas/userSimulation.schema';
import { User, UserDocument } from '../../v1/users/schemas/users.schema';
import { Simulation, SimulationDocument } from '../../v1/simulations/schemas/simulation.schema';

@Injectable()
export default class AssessmentsRepository {
  constructor(
    @InjectModel(Assessment.name)
    private assessmentModel: Model<AssessmentDocument>,
    @InjectModel(UserSimulation.name)
    private userSimulationModel: Model<UserSimulationDocument>,
    @InjectModel(User.name)
    private usersModel: Model<UserDocument>,
    @InjectModel(Simulation.name)
    private simulationModel: Model<SimulationDocument>,    
  ) {}

  public async bulkCreate(assessments: CreateAssessmentDao[]) {
    await this.assessmentModel.insertMany(assessments);
  }

  public async create(
    assessment: AssessmentDto,
  ): Promise<AssessmentDocument | null> {
    const newAssessment = await this.assessmentModel.create(assessment);
    return newAssessment.toObject();
  }

  public async findWithoutAggregation(query: MongoQuery<Assessment>) {
    return this.assessmentModel.find(
      query.filter,
      query.projection,
      query.options,
    );
  }

  // Original find not working, this is a quick-n-dirtry workaround for now.
  public async find(query: MongoQuery<Assessment>): Promise<Assessment[] | null> {
    // Perform find operation on 'assessments'
    const assessments = await this.assessmentModel
      .find(query.filter, query.projection, query.options)
      .lean();
    let _userSimulationsIds = [], _simulationsIds = [], _useAssessmentCyclesIds = [];
    if(assessments && assessments.length > 0) {
      assessments.map((a) => {
        _userSimulationsIds.push(a.userSimulationId);        
      })
    }
    // Perform find operations on other collections and store results    
    const userSimulations = await this.userSimulationModel.find({
      _id: { $in: _userSimulationsIds }
    }).lean();

    let _userIds = [];
    if(userSimulations && userSimulations.length > 0) {
      userSimulations.map((us) => {
        if(us.userId) {
          _userIds.push(us.userId);
        }
        if(us.simulationId) {
          _simulationsIds.push(us.simulationId);
        }
      })
    }

    const users = await this.usersModel.find({
      _id: { $in: _userIds }
    }).lean();

    const simulations = await this.simulationModel.find({
      _id: { $in: _simulationsIds }
    }).lean();
  
    // Loop through 'assessments' and manually perform the join logic
    for (let assessment of assessments) {      
      assessment['userSimulation'] = userSimulations.find(us => us._id.toString() === assessment.userSimulationId);
  
      if (assessment['userSimulation']) {
        assessment['userSimulation'].user = users.find(u => u._id.toString() === assessment['userSimulation'].userId);
        assessment['userSimulation'].simulation = simulations.find(s => s._id.toString() === assessment['userSimulation'].simulationId);
      }
    }
    
    return assessments;
  }

  public async find_notWorking(
    query: MongoQuery<Assessment>,
  ): Promise<Assessment[] | null> {
    // return this.assessmentModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    const { filter } = query;

    return this.assessmentModel.aggregate([
      {
        $match: { ...filter },
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
      {
        $addFields: {
          userAssessmentCycleId: {
            $toObjectId: '$userAssessmentCycleId',
          },
        },
      },
      {
        $lookup: {
          from: 'userAssessmentCycles',
          as: 'userAssessmentCycle',
          localField: 'userAssessmentCycleId',
          foreignField: '_id',
          pipeline: [
            {
              $addFields: {
                userSimulationId: { $toObjectId: '$userSimulationId' },
              },
            },
            {
              $lookup: {
                from: 'userSimulations',
                as: 'userSimulation',
                localField: 'userSimulationId',
                foreignField: '_id',
              },
            },
            {
              $unwind: {
                path: '$userSimulation',
                preserveNullAndEmptyArrays: false,
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
                as: 'user',
                localField: 'userId',
                foreignField: '_id',
              },
            },
            {
              $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $addFields: {
                assessmentTypeId: { $toObjectId: '$assessmentTypeId' },
              },
            },
            {
              $lookup: {
                from: 'assessmentTypes',
                as: 'assessmentType',
                localField: 'assessmentTypeId',
                foreignField: '_id',
              },
            },
            {
              $unwind: {
                path: '$assessmentType',
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $addFields: {
                saleId: { $toObjectId: '$saleId' },
              },
            },
            {
              $lookup: {
                from: 'sales',
                as: 'sale',
                localField: 'saleId',
                foreignField: '_id',
              },
            },
            {
              $unwind: {
                path: '$sale',
                preserveNullAndEmptyArrays: false,
              },
            },
            // {
            //   $lookup: {
            //     from: 'userSimulations',
            //     pipeline: [
            //       {
            //         $match: {

            //             $in: [{ $toString: '$_id' }, '$$userSimulationIds'],
            //           },
            //         },
            //       },
            //     ],
            //     as: 'userSimulations',
            //   },
            // },
          ],
        },
      },
      {
        $addFields: {
          _id: { $toString: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'answers',
          as: 'answers',
          localField: '_id',
          foreignField: 'assessmentId',
          pipeline: [
            {
              $match: {
                $or: [
                  { status: AnswerStatus.Correct },
                  { status: AnswerStatus.InCorrect },
                ],
              },
            },
            { $addFields: { findingId: { $toObjectId: '$findingId' } } },
            {
              $lookup: {
                from: 'findings',
                as: 'finding',
                localField: 'findingId',
                foreignField: '_id',
                pipeline: [
                  { $addFields: { domainId: { $toObjectId: '$domainId' } } },
                  {
                    $lookup: {
                      from: 'domains',
                      as: 'domain',
                      localField: 'domainId',
                      foreignField: '_id',
                      pipeline: [
                        {
                          $addFields: {
                            parentId: { $toObjectId: '$parentId' },
                          },
                        },
                        {
                          $lookup: {
                            from: 'domains',
                            as: 'parent',
                            localField: 'parentId',
                            foreignField: '_id',
                          },
                        },
                        {
                          $unwind: {
                            path: '$parent',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: '$domain',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$finding',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                noteId: { $toObjectId: '$noteId' },
              },
            },
            {
              $lookup: {
                from: 'notes',
                as: 'note',
                localField: 'noteId',
                foreignField: '_id',
              },
            },
            {
              $unwind: {
                path: '$note',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$userAssessmentCycle',
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $addFields: {
      //     'user._id': {
      //       $toObjectId: '$userId',
      //     },
      //   },
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     as: 'user',
      //     localField: 'userId',
      //     foreignField: '_id',
      //   },
      // },
      // {
      //   $unwind: {
      //     path: '$user',
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
    ]);
  }

  public async count(query: MongoQuery<Assessment>) {
    // If the query has options (e.g., a limit specified as {limit: 10}), this method 
    // will return only the count of the specified number of data, not the whole count of data.
    return this.assessmentModel
      .find(query.filter, query.projection, {})
      .count();
  }

  public async findOne(
    query: MongoQuery<Assessment>,
  ): Promise<Assessment | null> {
    return this.assessmentModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Assessment | null> {
    return this.assessmentModel.findById(id).lean();
  }

  public async update(
    body: MongoUpdate<Assessment>,
  ): Promise<Assessment | null> {
    const { filter, update, options } = body;
    return this.assessmentModel
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

  public async deleteMany(
    query: MongoDelete<Assessment>,
  ): Promise<Assessment[] | null> {
    const { filter, options } = query;
    return this.assessmentModel.deleteMany(filter, options).lean();
  }
}
