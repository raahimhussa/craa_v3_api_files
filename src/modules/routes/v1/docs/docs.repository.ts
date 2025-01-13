import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { Doc, DocDocument } from './schemas/doc.schema';
import CreateDocDto from './dto/createDoc.dto';

@Injectable()
export default class DocsRepository {
  constructor(@InjectModel(Doc.name) private docModel: Model<DocDocument>) {}

  public async create(role: CreateDocDto) {
    const newDoc = await this.docModel.create({
      ...role,
      updatedAt: new Date(),
      createdAt: new Date(),
      isDeleted: false,
    });
    return newDoc.toObject();
  }

  public async find(query: FindQuery<Doc>) {
    return this.docModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: FindQuery<Doc>) {
    return this.docModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async updateOne(body: PatchBody<Doc>): Promise<Doc | null> {
    await this.docModel.updateOne(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.docModel
      .updateOne(body.filter, body.update, body.options)
      .lean();
  }

  public async updateMany(body: PatchBody<Doc>): Promise<Doc[] | null> {
    await this.docModel.updateMany(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.docModel
      .updateMany(body.filter, body.update, body.options)
      .lean();
  }

  public async deleteOne(query: DeleteQuery<Doc>): Promise<Doc | null> {
    return this.docModel.deleteOne(query.filter, query.options).lean();
  }

  public async deleteMany(
    query: DeleteQuery<DocDocument>,
  ): Promise<Doc[] | null> {
    return this.docModel.deleteMany(query.filter, query.options).lean();
  }
}
