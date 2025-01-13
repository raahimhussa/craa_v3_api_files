import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { DocumentVariable } from './schemas/documentVariables.schema';
import DocumentVariableDto from './dto/documentVariables.dto';

@Injectable()
export default class DocumentVariablesRepository {
  constructor(
    @InjectModel(DocumentVariable.name)
    private documentVariableModel: Model<DocumentVariable>,
  ) {}

  public async create(
    documentVariable: DocumentVariableDto,
  ): Promise<DocumentVariable | null> {
    const newDocumentVariable = await this.documentVariableModel.create(
      documentVariable,
    );
    return newDocumentVariable.toObject();
  }

  public async findForCount(
    query: MongoQuery<DocumentVariable>,
  ): Promise<DocumentVariable[] | null> {
    const { filter, projection, options } = query;
    // return this.documentVariableModel.find(filter, projection, options).lean();
    return await this.documentVariableModel.aggregate([
      { $match: { ...filter } },
      { $addFields: { group_id: { $toObjectId: '$groupId' } } },
      {
        $lookup: {
          from: 'documentVariableGroups',
          localField: 'group_id',
          foreignField: '_id',
          as: 'group',
        },
      },
      {
        $unwind: {
          path: '$group',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }
  public async find(
    query: MongoQuery<DocumentVariable>,
  ): Promise<DocumentVariable[] | null> {
    const { filter, projection, options } = query;
    // return this.documentVariableModel.find(filter, projection, options).lean();
    return await this.documentVariableModel.aggregate([
      { $match: { ...filter } },
      { $addFields: { group_id: { $toObjectId: '$groupId' } } },
      {
        $lookup: {
          from: 'documentVariableGroups',
          localField: 'group_id',
          foreignField: '_id',
          as: 'group',
        },
      },
      {
        $unwind: {
          path: '$group',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $skip: options?.skip ? options.skip : 0,
      },
      {
        $limit: options?.limit ? options.limit : 20,
      },
    ]);
  }

  public async findOne(
    query: MongoQuery<DocumentVariable>,
  ): Promise<DocumentVariable | null> {
    const { filter, projection, options } = query;
    return this.documentVariableModel
      .findOne(filter, projection, options)
      .lean();
  }

  public async updateOne(
    body: MongoUpdate<DocumentVariable>,
  ): Promise<DocumentVariable | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.documentVariableModel
      .updateOne(filter, _update, options)
      .lean();
  }

  public async updateMany(
    body: MongoUpdate<DocumentVariable>,
  ): Promise<DocumentVariable[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.documentVariableModel
      .updateMany(filter, _update, options)
      .lean();
  }

  public async deleteOne(
    query: MongoDelete<DocumentVariable>,
  ): Promise<DocumentVariable | null> {
    const { filter, options } = query;
    return this.documentVariableModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<DocumentVariable>,
  ): Promise<DocumentVariable[] | null> {
    const { filter, options } = query;
    return this.documentVariableModel.deleteMany(filter, options).lean();
  }
}
