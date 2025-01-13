import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import {
  DocumentVariableGroup,
  DocumentVariableGroupDocument,
} from './schemas/documentVariableGroups.schema';

import FoldersService from '../../v2/folders/folders.service';
import DocumentVariableGroupDto from './dto/documentVariableGroups.dto';
import DocumentVariableGroupsRepository from './documentVariableGroups.repository';
import { Workbook } from 'exceljs';

@Injectable()
export default class DocumentVariableGroupsService {
  constructor(
    private readonly documentVariableGroupsRepository: DocumentVariableGroupsRepository,
  ) {}

  create(
    documentVariableGroup: DocumentVariableGroupDto,
  ): Promise<DocumentVariableGroup | null> {
    return this.documentVariableGroupsRepository.create(documentVariableGroup);
  }

  find(
    query: MongoQuery<DocumentVariableGroup>,
  ): Promise<DocumentVariableGroup[] | null> {
    return this.documentVariableGroupsRepository.find(query);
  }

  update(body: MongoUpdate<DocumentVariableGroup>) {
    if (body.options?.multi) {
      return this.documentVariableGroupsRepository.updateOne(body);
    }
    return this.documentVariableGroupsRepository.updateMany(body);
  }

  delete(query: MongoDelete<DocumentVariableGroup>) {
    return this.documentVariableGroupsRepository.deleteOne(query);
  }
}
