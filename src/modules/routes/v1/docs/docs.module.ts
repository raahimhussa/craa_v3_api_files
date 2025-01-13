import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { Doc, DocSchema } from './schemas/doc.schema';
import DocsRepository from './docs.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Doc.name, schema: DocSchema }])],
  controllers: [DocsController],
  providers: [DocsService, DocsRepository],
  exports: [DocsService, DocsRepository],
})
export default class DocsModule {}
