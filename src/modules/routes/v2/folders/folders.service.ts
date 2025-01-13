import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import FolderDto from './dto/folder.dto';
import FoldersRepository from './folders.repository';
import { Folder } from './schemas/folder.schema';

@Injectable()
export default class FoldersService {
  constructor(private readonly foldersRepository: FoldersRepository) {}

  public async create(folder: FolderDto): Promise<Folder | null> {
    return this.foldersRepository.create(folder);
  }

  public async find(query: MongoQuery<Folder>): Promise<Folder[] | null> {
    return this.foldersRepository.find(query);
  }

  public async findOne(query: MongoQuery<Folder>): Promise<Folder | null> {
    return this.foldersRepository.findOne(query);
  }

  public async findById(id: string): Promise<Folder | null> {
    return this.foldersRepository.findById(id);
  }

  public async update(body: MongoUpdate<Folder>): Promise<Folder | null> {
    return this.foldersRepository.update(body);
  }

  public async delete(query: MongoDelete<Folder>): Promise<Folder[] | null> {
    return this.foldersRepository.deleteMany(query);
  }

  public async findByIds(folderIds: any[]): Promise<Folder[]> {
    return this.foldersRepository.find({
      filter: {
        folderId: {
          $in: folderIds,
        },
      },
    });
  }
}
