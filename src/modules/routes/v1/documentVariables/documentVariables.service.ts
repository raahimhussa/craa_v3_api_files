import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import {
  DocumentVariable,
  DocumentVariableDocument,
} from './schemas/documentVariables.schema';

import FoldersService from '../../v2/folders/folders.service';
import DocumentVariableDto from './dto/documentVariables.dto';
import DocumentVariablesRepository from './documentVariables.repository';
import { Workbook } from 'exceljs';

@Injectable()
export default class DocumentVariablesService {
  constructor(
    private readonly documentVariablesRepository: DocumentVariablesRepository,
  ) {}

  create(
    documentVariable: DocumentVariableDto,
  ): Promise<DocumentVariable | null> {
    return this.documentVariablesRepository.create(documentVariable);
  }

  async count(query: MongoQuery<DocumentVariable>) {
    const variables = await this.documentVariablesRepository.findForCount(
      query,
    );
    const searchString = query?.options?.fields?.searchString;
    if (searchString !== undefined) {
      return variables.filter((_variable) => {
        if (
          _variable.key?.toLowerCase().includes(searchString.toLowerCase()) ||
          _variable.value?.toLowerCase().includes(searchString.toLowerCase())
        )
          return true;
        return false;
      }).length;
    } else {
      return variables.length;
    }
  }
  async find(
    query: MongoQuery<DocumentVariable>,
  ): Promise<DocumentVariable[] | null> {
    const variables = await this.documentVariablesRepository.find(query);
    const searchString = query?.options?.fields?.searchString;
    if (searchString !== undefined) {
      return variables.filter((_variable) => {
        if (
          _variable.key?.toLowerCase().includes(searchString.toLowerCase()) ||
          _variable.value?.toLowerCase().includes(searchString.toLowerCase())
        )
          return true;
        return false;
      });
    } else {
      return variables;
    }
  }

  update(body: MongoUpdate<DocumentVariable>) {
    if (body.options?.multi) {
      return this.documentVariablesRepository.updateOne(body);
    }
    return this.documentVariablesRepository.updateMany(body);
  }

  delete(query: MongoDelete<DocumentVariable>) {
    return this.documentVariablesRepository.deleteOne(query);
  }
}
