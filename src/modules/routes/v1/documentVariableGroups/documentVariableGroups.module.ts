import * as AutoIncrementFactory from 'mongoose-sequence';

import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import {
  DocumentVariableGroup,
  DocumentVariableGroupSchema,
} from './schemas/documentVariableGroups.schema';

import { Connection } from 'mongoose';
import FoldersModule from '../../v2/folders/folders.module';
import { Module } from '@nestjs/common';
import { DocumentVariableGroupsController } from './documentVariableGroups.controller';
import DocumentVariableGroupsRepository from './documentVariableGroups.repository';
import DocumentVariableGroupsService from './documentVariableGroups.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: DocumentVariableGroup.name,
        useFactory: async (connection: Connection) => {
          const schema = DocumentVariableGroupSchema;
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    FoldersModule,
  ],
  controllers: [DocumentVariableGroupsController],
  providers: [DocumentVariableGroupsService, DocumentVariableGroupsRepository],
  exports: [DocumentVariableGroupsService, DocumentVariableGroupsRepository],
})
export default class DocumentVariableGroupsModule {}
