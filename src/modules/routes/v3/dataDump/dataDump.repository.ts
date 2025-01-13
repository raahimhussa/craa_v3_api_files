import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  MongoQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { AssessmentType } from '../../v1/assessmentTypes/schemas/assessmentType.schema';

@Injectable()
export default class DataDumpRepository {
  constructor(
    @InjectModel(AssessmentType.name)
    private assessmentTypeModel: Model<AssessmentType>,
  ) {}

  public async getSimDocIdsFromAssessmentTypeId(assessmentTypeId: string) {
    if (!assessmentTypeId) return [];

    return (
      await this.assessmentTypeModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: ['$_id', new mongoose.Types.ObjectId(assessmentTypeId)],
            },
          },
        },
        {
          $addFields: {
            'baseline.simulationId': { $toObjectId: '$baseline.simulationId' },
          },
        },
        {
          $lookup: {
            from: 'simulations',
            localField: 'baseline.simulationId',
            foreignField: '_id',
            pipeline: [
              {
                $lookup: {
                  from: 'simDocs',
                  let: { folderIds: '$folderIds' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $in: ['$folderId', '$$folderIds'] },
                      },
                    },
                  ],
                  as: 'simDocs',
                },
              },
              {
                $unwind: {
                  path: '$simulation',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'baseline.simulation',
          },
        },
        {
          $unwind: {
            path: '$baseline.simulation',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            simDocIds: '$baseline.simulation.simDocs._id',
          },
        },
      ])
    )?.[0]?.simDocIds;
  }
}
