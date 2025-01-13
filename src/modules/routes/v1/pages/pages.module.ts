import * as AutoIncrementFactory from 'mongoose-sequence';

import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Page, PageSchema } from './schemas/page.schema';

import { Connection } from 'mongoose';
import FoldersModule from '../../v2/folders/folders.module';
import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import PagesRepository from './pages.repository';
import PagesService from './pages.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Page.name,
        useFactory: async (connection: Connection) => {
          const schema = PageSchema;
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    FoldersModule,
  ],
  controllers: [PagesController],
  providers: [PagesService, PagesRepository],
  exports: [PagesService, PagesRepository],
})
export default class PagesModule {}
