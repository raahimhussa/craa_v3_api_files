import { PdfFolder, PdfFolderSchema } from './schemas/pdfFolder.schema';

import { FoldersController } from './pdfFolders.controller';
import FoldersRepository from './pdfFolders.repository';
import FoldersService from './pdfFolders.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PdfFolder.name, schema: PdfFolderSchema },
    ]),
  ],
  controllers: [FoldersController],
  providers: [FoldersService, FoldersRepository],
  exports: [FoldersService, FoldersRepository],
})
export default class PdfFoldersModule {}
