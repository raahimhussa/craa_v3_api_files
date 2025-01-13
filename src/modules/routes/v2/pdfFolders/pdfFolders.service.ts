import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { FilesService } from '../../v1/files/files.service';
import { Folder } from '../folders/schemas/folder.schema';
import { Injectable } from '@nestjs/common';
import { PdfFolder } from './schemas/pdfFolder.schema';
import { PdfFolderCreateDto } from './dto/pdfFolder.dto';
import PdfFoldersRepository from './pdfFolders.repository';

@Injectable()
export default class PdfFoldersService {
  constructor(private readonly foldersRepository: PdfFoldersRepository) {}

  public async create(folder: PdfFolderCreateDto): Promise<PdfFolder | null> {
    return this.foldersRepository.create(folder);
  }

  public async find(query: MongoQuery<PdfFolder>): Promise<PdfFolder[] | null> {
    return this.foldersRepository.find(query);
  }

  public async getRootFolder(): Promise<PdfFolder | null> {
    return this.foldersRepository.findOne({
      filter: {
        isDeleted: false,
        isRoot: true,
      },
    });
  }

  public async findOne(
    query: MongoQuery<PdfFolder>,
  ): Promise<PdfFolder | null> {
    return this.foldersRepository.findOne(query);
  }

  public async findById(id: string): Promise<PdfFolder | null> {
    return this.foldersRepository.findById(id);
  }

  public async update(body: MongoUpdate<PdfFolder>): Promise<PdfFolder | null> {
    return this.foldersRepository.update(body);
  }

  public async rename(body: MongoUpdate<PdfFolder>): Promise<PdfFolder | null> {
    return this.foldersRepository.update(body);
  }

  public async delete(
    query: MongoDelete<PdfFolder>,
  ): Promise<PdfFolder[] | null> {
    return this.foldersRepository.deleteMany(query);
  }
}
