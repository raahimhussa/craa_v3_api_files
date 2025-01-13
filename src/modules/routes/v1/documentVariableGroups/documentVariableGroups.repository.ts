import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { DocumentVariableGroup } from './schemas/documentVariableGroups.schema';
import DocumentVariableGroupDto from './dto/documentVariableGroups.dto';

@Injectable()
export default class DocumentVariableGroupsRepository {
  constructor(
    @InjectModel(DocumentVariableGroup.name)
    private documentVariableGroupModel: Model<DocumentVariableGroup>,
  ) {}

  public async create(
    documentVariableGroup: DocumentVariableGroupDto,
  ): Promise<DocumentVariableGroup | null> {
    const newDocumentVariableGroup =
      await this.documentVariableGroupModel.create(documentVariableGroup);
    return newDocumentVariableGroup.toObject();
  }

  public async find(
    query: MongoQuery<DocumentVariableGroup>,
  ): Promise<DocumentVariableGroup[] | null> {
    const { filter, projection, options } = query;
    return this.documentVariableGroupModel
      .find(filter, projection, options)
      .lean();
  }

  public async findOne(
    query: MongoQuery<DocumentVariableGroup>,
  ): Promise<DocumentVariableGroup | null> {
    const { filter, projection, options } = query;
    return this.documentVariableGroupModel
      .findOne(filter, projection, options)
      .lean();
  }

  public async updateOne(
    body: MongoUpdate<DocumentVariableGroup>,
  ): Promise<DocumentVariableGroup | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.documentVariableGroupModel
      .updateOne(filter, _update, options)
      .lean();
  }

  public async updateMany(
    body: MongoUpdate<DocumentVariableGroup>,
  ): Promise<DocumentVariableGroup[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.documentVariableGroupModel
      .updateMany(filter, _update, options)
      .lean();
  }

  public async deleteOne(
    query: MongoDelete<DocumentVariableGroup>,
  ): Promise<DocumentVariableGroup | null> {
    const { filter, options } = query;
    return this.documentVariableGroupModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<DocumentVariableGroup>,
  ): Promise<DocumentVariableGroup[] | null> {
    const { filter, options } = query;
    return this.documentVariableGroupModel.deleteMany(filter, options).lean();
  }
}
