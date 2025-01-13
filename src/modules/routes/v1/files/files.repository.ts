import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  MongoQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { FileDocument, File } from './schemas/files.schema';
import CreateFileDto from './dto/create-file.dto';

@Injectable()
export default class FilesRepository {
  constructor(
    @InjectModel(File.name) private filesModel: Model<FileDocument>,
  ) {}

  public async create(file: CreateFileDto) {
    const newFile = await this.filesModel.create({
      ...file,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    return newFile.toObject();
  }

  public async find(query: FindQuery<File>): Promise<FileDocument[] | null> {
    return this.filesModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async queryFind(
    query: FindQuery<File>,
  ): Promise<FileDocument[] | null> {
    return this.filesModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async pdfFind(path: string): Promise<FileDocument[] | null> {
    const mimeType = 'application/pdf';
    return this.filesModel
      .find({
        mimeType,
        path,
        isDeleted: false,
      })
      .lean();
    // return this.filesModel
    //   .find(query.filter, query.projection, query.options)
    //   .lean();
  }

  public async findOne(
    query: FindQuery<FileDocument>,
  ): Promise<FileDocument | null> {
    return this.filesModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async getNumberOfElement(query: MongoQuery<File>): Promise<number> {
    return this.filesModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async updateOne(
    query: PatchBody<FileDocument>,
  ): Promise<FileDocument | null> {
    await this.filesModel.updateOne(query.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.filesModel
      .updateOne(query.filter, query.update, query.options)
      .lean();
  }

  public async updateMany(
    query: PatchBody<FileDocument>,
  ): Promise<FileDocument[] | null> {
    return await this.filesModel
      .updateMany(
        query.filter,
        {
          ...query.update,
          updatedAt: new Date(),
        },
        query.options,
      )
      .lean();
  }

  public async rename(
    query: PatchBody<FileDocument>,
  ): Promise<FileDocument[] | null> {
    return await this.filesModel
      .updateMany(query.filter, query.update, query.options)
      .lean();
  }

  public async deleteOne(
    query: DeleteQuery<FileDocument>,
  ): Promise<FileDocument | null> {
    return this.filesModel.deleteOne(query.filter).lean();
  }

  public async deleteMany(
    query: DeleteQuery<FileDocument>,
  ): Promise<FileDocument[] | null> {
    return this.filesModel.deleteOne(query).lean();
  }
}
