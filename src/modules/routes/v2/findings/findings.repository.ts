import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Finding, FindingDocument } from './schemas/finding.schema';
import FindingDto from './dto/finding.dto';

@Injectable()
export default class FindingsRepository {
  constructor(
    @InjectModel(Finding.name) private findingModel: Model<FindingDocument>,
  ) {}

  public async create(finding: FindingDto): Promise<Finding | null> {
    const newFinding = await this.findingModel.create(finding);
    return newFinding.toObject();
  }

  public async bulkCreate(findings: FindingDto[]) {
    await this.findingModel.insertMany(findings);
  }

  public async findWithOriginal(
    query: MongoQuery<Finding>,
  ): Promise<Finding[] | null> {
    return this.findingModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async find(query: MongoQuery<Finding>): Promise<Finding[] | null> {
    // return this.findingModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
    // console.log(query);
    return this.findingModel.aggregate([
      {
        $match: {
          ...query.filter,
        },
      },
      {
        $addFields: {
          key_id: {
            $convert: {
              input: '$keyConceptId',
              to: 'objectId',
              onError: '',
              onNull: '',
            },
          },
        },
      },
      // {
      //   $convert: {input: '$keyConceptId', to : 'objectId', onError: '',onNull: ''}
      // },
      {
        $lookup: {
          from: 'simDocs',
          let: { vid: '$simDocIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$_id',
                    {
                      $map: {
                        input: '$$vid',
                        in: { $toObjectId: '$$this' },
                      },
                    },
                  ],
                },
              },
            },
          ],
          as: 'simDocs',
        },
      },
      {
        $lookup: {
          from: 'keyConcepts',
          // localField: 'key_id',
          localField: 'key_id',
          foreignField: '_id',
          as: 'keyconcept',
        },
      },
      {
        $unwind: {
          path: '$keyconcept',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }

  public async findOne(query: MongoQuery<Finding>): Promise<Finding | null> {
    return this.findingModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Finding | null> {
    // return this.findingModel.findById(id).lean();
    //@ts-ignore
    return this.findingModel.aggregate([
      {
        $match: {
          _id: { $eq: new mongoose.Types.ObjectId(id) },
        },
      },
      {
        $addFields: { key_id: { $toObjectId: '$keyConceptId' } },
      },
      {
        $lookup: {
          from: 'simDocs',
          let: { vid: '$simDocIds' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$_id',
                    {
                      $map: {
                        input: '$$vid',
                        in: { $toObjectId: '$$this' },
                      },
                    },
                  ],
                },
              },
            },
          ],
          as: 'simDocs',
        },
      },
      {
        $lookup: {
          from: 'keyConcepts',
          localField: 'key_id',
          foreignField: '_id',
          as: 'keyconcept',
        },
      },
      {
        $unwind: {
          path: '$keyconcept',
        },
      },
    ]);
  }

  public async findMaxNumber() {
    const result = await this.findingModel.aggregate([
      { $group: { _id: null, maxCounter: { $max: '$visibleId' } } },
      { $project: { _id: 0, maxCounter: 1 } },
    ]);

    return result[0]?.maxCounter || 0;
  }

  public async getNumberOfElement(query: MongoQuery<Finding>): Promise<number> {
    return this.findingModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async update(body: MongoUpdate<Finding>): Promise<Finding | null> {
    const { filter, update, options } = body;

    return this.findingModel
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
    query: MongoDelete<Finding>,
  ): Promise<Finding[] | null> {
    const { filter, options } = query;
    return this.findingModel.deleteMany(filter, options).lean();
  }
}
