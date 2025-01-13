import * as AutoIncrementFactory from 'mongoose-sequence';

import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { SimDoc, SimDocSchema } from './schemas/simDoc.schema';

import { Connection } from 'mongoose';
import FoldersModule from '../../v2/folders/folders.module';
import { Module } from '@nestjs/common';
import { SimDocsController } from './simDocs.controller';
import SimDocsRepository from './simDocs.repository';
import SimDocsService from './simDocs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SimDoc.name,
        schema: SimDocSchema,
      },
    ]),
    FoldersModule,
  ],
  controllers: [SimDocsController],
  providers: [SimDocsService, SimDocsRepository],
  exports: [SimDocsService, SimDocsRepository],
})
export default class SimDocsModule {}
