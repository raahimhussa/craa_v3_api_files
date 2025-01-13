import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { PdfFolder, PdfFolderDocument } from './schemas/pdfFolder.schema';
import { PdfFolderCreateDto, PdfFolderDto } from './dto/pdfFolder.dto';

@Injectable()
export default class PdfFoldersRepository {
  constructor(
    @InjectModel(PdfFolder.name) private folderModel: Model<PdfFolderDocument>,
  ) {}

  public async create(folder: PdfFolderCreateDto): Promise<PdfFolder | null> {
    const newFolder = await this.folderModel.create(folder);
    return newFolder.toObject();
  }

  public async find(query: MongoQuery<PdfFolder>): Promise<PdfFolder[] | null> {
    return this.folderModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(
    query: MongoQuery<PdfFolder>,
  ): Promise<PdfFolder | null> {
    return this.folderModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async getNumberOfElement(
    query: MongoQuery<PdfFolder>,
  ): Promise<number> {
    return this.folderModel
      .find(query.filter, query.projection, query.options)
      .count();
  }

  public async findById(id: string): Promise<PdfFolder | null> {
    return this.folderModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<PdfFolder>): Promise<PdfFolder | null> {
    const { filter, update, options } = body;
    return this.folderModel
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

  public async rename(body: MongoUpdate<PdfFolder>): Promise<PdfFolder | null> {
    const { filter, update, options } = body;
    return this.folderModel.updateMany(filter, update, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<PdfFolder>,
  ): Promise<PdfFolder[] | null> {
    const { filter, options } = query;
    return this.folderModel.deleteMany(filter, options).lean();
  }

  // public async findByIds(folderIds: any[]): Promise<Folder[]> {
  //   return this.folderModel
  //     .find({
  //       filter: {
  //         _id: {
  //           $in: folderIds,
  //         },
  //       },
  //     })
  //     .lean();
  // }
}
