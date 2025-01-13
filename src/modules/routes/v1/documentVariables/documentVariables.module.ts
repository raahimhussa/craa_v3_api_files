import * as AutoIncrementFactory from 'mongoose-sequence';

import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import {
  DocumentVariable,
  DocumentVariableSchema,
} from './schemas/documentVariables.schema';

import { Connection } from 'mongoose';
import FoldersModule from '../../v2/folders/folders.module';
import { Module } from '@nestjs/common';
import { DocumentVariablesController } from './documentVariables.controller';
import DocumentVariablesRepository from './documentVariables.repository';
import DocumentVariablesService from './documentVariables.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: DocumentVariable.name,
        useFactory: async (connection: Connection) => {
          const schema = DocumentVariableSchema;
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    FoldersModule,
  ],
  controllers: [DocumentVariablesController],
  providers: [DocumentVariablesService, DocumentVariablesRepository],
  exports: [DocumentVariablesService, DocumentVariablesRepository],
})
export default class DocumentVariablesModule {}
