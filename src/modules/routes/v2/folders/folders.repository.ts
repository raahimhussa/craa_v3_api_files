import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Folder, FolderDocument } from './schemas/folder.schema';
import FolderDto from './dto/folder.dto';

@Injectable()
export default class FoldersRepository {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<FolderDocument>,
  ) {}

  public async create(folder: FolderDto): Promise<Folder | null> {
    if (folder.folderId) {
      const folderCount = await this.folderModel
        .find({
          folderId: folder.folderId,
        })
        .count();
      const _newFolder = await this.folderModel.create({
        ...folder,
        seq: folderCount,
      });
      return _newFolder.toObject();
    }
    //-- deletion is critial to make a new one appear in the folder tree
    delete folder['_id'];
    delete folder['folderId'];

    const newFolder = await this.folderModel.create(folder);
    // console.log('folders.repository::create folder: ', folder, newFolder);
    return newFolder.toObject();
  }

  public async find(query: MongoQuery<Folder>): Promise<Folder[] | null> {
    return this.folderModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Folder>): Promise<Folder | null> {
    return this.folderModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Folder | null> {
    return this.folderModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Folder>): Promise<Folder | null> {
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

  public async deleteMany(
    query: MongoDelete<Folder>,
  ): Promise<Folder[] | null> {
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
