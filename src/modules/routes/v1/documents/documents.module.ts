import * as AutoIncrementFactory from 'mongoose-sequence';

import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Document, DocumentSchema } from './schemas/document.schema';

import { Connection } from 'mongoose';
import FoldersModule from '../../v2/folders/folders.module';
import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import DocumentsRepository from './documents.repository';
import DocumentsService from './documents.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Document.name,
        useFactory: async (connection: Connection) => {
          const schema = DocumentSchema;
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    FoldersModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository],
  exports: [DocumentsService, DocumentsRepository],
})
export default class DocumentsModule {}
