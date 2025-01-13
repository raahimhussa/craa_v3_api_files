import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Document } from './schemas/document.schema';
import DocumentDto from './dto/documents.dto';

@Injectable()
export default class DocumentsRepository {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<Document>,
  ) {}

  public async create(document: DocumentDto): Promise<Document | null> {
    const newDocument = await this.documentModel.create(document);
    return newDocument.toObject();
  }

  public async findForCount(
    query: MongoQuery<Document>,
  ): Promise<Document[] | null> {
    const { filter, projection, options } = query;
    return await this.documentModel.aggregate([{ $match: { ...filter } }]);
    // return this.documentModel.find(filter, projection, options).lean();
  }
  public async find(query: MongoQuery<Document>): Promise<Document[] | null> {
    const { filter, projection, options } = query;
    const _filter = { ...filter };
    if (_filter?._id) {
      _filter._id = new mongoose.Types.ObjectId(_filter._id);
    }
    return await this.documentModel.aggregate([
      { $match: { ..._filter } },
      { $sort: { createdAt: -1 } },
      {
        $skip: options?.skip ? options.skip : 0,
      },
      {
        $limit: options?.limit ? options.limit : 20,
      },
    ]);
    // return this.documentModel.find(filter, projection, options).lean();
  }

  public async findOne(query: MongoQuery<Document>): Promise<Document | null> {
    const { filter, projection, options } = query;
    const _filter = { ...filter };
    if (_filter?._id) {
      _filter._id = new mongoose.Types.ObjectId(_filter._id);
    }
    return this.documentModel.findOne(_filter, projection, options).lean();
  }

  public async updateOne(
    body: MongoUpdate<Document>,
  ): Promise<Document | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.documentModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(
    body: MongoUpdate<Document>,
  ): Promise<Document[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.documentModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(
    query: MongoDelete<Document>,
  ): Promise<Document | null> {
    const { filter, options } = query;
    return this.documentModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<Document>,
  ): Promise<Document[] | null> {
    const { filter, options } = query;
    return this.documentModel.deleteMany(filter, options).lean();
  }
}
