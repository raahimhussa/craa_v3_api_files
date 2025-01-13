import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Document, DocumentDocument } from './schemas/document.schema';

import FoldersService from '../../v2/folders/folders.service';
import DocumentDto from './dto/documents.dto';
import DocumentsRepository from './documents.repository';
import { Workbook } from 'exceljs';

@Injectable()
export default class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly foldersService: FoldersService,
  ) {}

  create(document: DocumentDto): Promise<Document | null> {
    return this.documentsRepository.create(document);
  }

  async find(query: MongoQuery<Document>): Promise<Document[] | null> {
    // return this.documentsRepository.find(query);
    const documents = await this.documentsRepository.find(query);
    const searchString = query?.options?.fields?.searchString;
    if (searchString !== undefined) {
      return documents.filter((_variable) => {
        if (_variable.title?.toLowerCase().includes(searchString.toLowerCase()))
          return true;
        return false;
      });
    } else {
      return documents;
    }
  }
  async count(query: MongoQuery<Document>) {
    // return this.documentsRepository.find(query);
    const documents = await this.documentsRepository.findForCount(query);
    const searchString = query?.options?.fields?.searchString;
    if (searchString !== undefined) {
      return documents.filter((_variable) => {
        if (_variable.title?.toLowerCase().includes(searchString.toLowerCase()))
          return true;
        return false;
      }).length;
    } else {
      return documents.length;
    }
  }

  update(body: MongoUpdate<DocumentDocument>) {
    if (body.options?.multi) {
      return this.documentsRepository.updateOne(body);
    }
    return this.documentsRepository.updateMany(body);
  }

  delete(query: MongoDelete<DocumentDocument>) {
    return this.documentsRepository.deleteOne(query);
  }
}
